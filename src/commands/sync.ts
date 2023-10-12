import { colors, Command, Select } from 'cliffy';
import { join } from 'std/path';
import { ghNoReplyCheck, logger, promptAllInputs, validate } from 'lib';
import { getConfig, getConfigDir, setConfig } from '../config.ts';
import {
  AuthorSchema,
  AuthorType,
  createCommit,
  getCommitsByEmail,
  getGitAuthor,
  getGitHistory,
  pushRepositoryChanges,
} from '../git.ts';

import {
  cloneRepository,
  getRepositories,
  pullRepositoryChanges,
} from '../gh.ts';

const SYNC_REPO_PATH = join(getConfigDir(), 'sync-repo');

export default new Command()
  .description('Synchronize commits from local repositories to GitHub profile.')
  .option('-d, --debug', 'Enable debug output.')
  .action(async ({ debug }) => {
    if (debug) logger.enable();

    let config = await getConfig();
    logger.info('Current config:', config);

    if (!config.syncRepo) {
      logger.info('No sync repository found. Cloning one...');
      const repos = await getRepositories();
      logger.info('Found repositories:', repos);

      const id = await Select.prompt({
        message: 'Choose a repository to sync commits to:',
        hint:
          'Use arrow keys for navigation, space to select, and enter to submit. If you don\'t have a repository yet, create one and start again.',
        options: repos.map((repo) => ({ value: repo.id, name: repo.name })),
      });
      const selectedRepo = repos.find((repo) => repo.id === id);
      logger.info('Selected repository:', selectedRepo);
      await cloneRepository(selectedRepo!, 'sync-repo', getConfigDir());
      await setConfig({ syncRepo: selectedRepo });
      config = await getConfig();
      logger.info('New config:', config);
    } else {
      logger.info('Sync repository found. Pulling latest changes...');
      await pullRepositoryChanges(SYNC_REPO_PATH);
    }

    if (!config.author) {
      logger.info('No author found. Prompting one...');
      const currentGitAuthor = await getGitAuthor();
      logger.info(
        'Current git author configured in git config:',
        currentGitAuthor,
      );
      const [name, email] = await promptAllInputs(
        Object.keys(AuthorSchema.shape).map((key) => ({
          message: `Authoring ${key}:`,
          hint:
            `We will use this ${key} to author commits on the syncing repository.`,
          validate: validate(
            AuthorSchema.shape[key as keyof typeof AuthorSchema.shape].parse,
          ),
          default: currentGitAuthor?.[key as keyof typeof currentGitAuthor],
        })),
      );

      ghNoReplyCheck(email);

      const author: AuthorType = { name, email };
      logger.info('Selected author:', { name, email });
      await setConfig({ author });
      config = await getConfig();
      logger.info('New config:', config);
    }

    const history = await getGitHistory(SYNC_REPO_PATH);
    logger.info('Current history:', history);
    const authorsWithDirs: Array<AuthorType & { dir: string }> = Object.values(
      config.repos,
    ).flatMap((repo) =>
      repo.authors.map((author) => ({ ...author, dir: repo.dir }))
    );
    const commits = (await Promise.all(
      authorsWithDirs.map((author) =>
        getCommitsByEmail(author.email, author.dir)
      ),
    )).flat().filter((commit) =>
      !history.some((entry) => entry?.hash === commit.hash)
    );
    logger.info('New commits:', commits);

    if (!commits.length) {
      console.log('No new commits to synchronize. Exiting...');
      Deno.exit(0);
    }

    console.log(
      '\xa0🔍',
      colors.yellow(`Synchronizing new ${commits.length} commits...`),
    );

    commits.forEach((commit) => {
      logger.info('Creating commit:', commit);
      createCommit(
        { ...commit, author: config.author! },
        SYNC_REPO_PATH,
      );
    });

    logger.info('Pushing changes to sync repository...');
    await pushRepositoryChanges(SYNC_REPO_PATH);

    console.log(
      '\xa0🎉',
      colors.green(
        'All changes has been synchronized and pushed to your synching repository!',
      ),
    );
  });
