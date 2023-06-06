import { colors, Command, Select } from 'cliffy';
import { join } from 'std/path';
import { ghNoReplyCheck, promptAllInputs, validate } from 'lib';
import {
  getConfig,
  getConfigDir,
  getHistory,
  HistoryType,
  setConfig,
  setHistory,
} from '../config.ts';
import {
  AuthorSchema,
  AuthorType,
  createCommit,
  getCommitsByEmail,
  getGitAuthor,
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
  .action(async () => {
    let config = await getConfig();

    if (!config.syncRepo) {
      const repos = await getRepositories();

      const id = await Select.prompt({
        message: 'Choose a repository to sync commits to:',
        hint:
          'Use arrow keys for navigation, space to select, and enter to submit. If you don\'t have a repository yet, create one and start again.',
        options: repos.map((repo) => ({ value: repo.id, name: repo.name })),
      });
      const selectedRepo = repos.find((repo) => repo.id === id);
      await cloneRepository(selectedRepo!, 'sync-repo', getConfigDir());
      await setConfig({ syncRepo: selectedRepo });
      config = await getConfig();
    } else {
      await pullRepositoryChanges(SYNC_REPO_PATH);
    }

    if (!config.author) {
      const currentGitAuthor = await getGitAuthor();
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
      await setConfig({ author });
      config = await getConfig();
    }

    const currentHistory = await getHistory();
    const history: HistoryType = {};

    for (const [name, repo] of Object.entries(config.repos)) {
      history[name] = {};

      for (const author of repo.authors) {
        const commitsByEmail = await getCommitsByEmail(author.email, repo.dir);

        history[name]![author.email] = commitsByEmail.filter((commit) =>
          !currentHistory[name]?.[author.email]?.some((entry) =>
            entry?.hash === commit.hash
          )
        );
      }
    }

    const flatCommits = Object.values(history).flatMap((repo) =>
      Object.values(repo).flatMap((commits) => commits)
    );

    if (!flatCommits.length) {
      console.log('No new commits to synchronize. Exiting...');
      Deno.exit(0);
    }

    console.log(
      '\xa0🔍',
      colors.yellow(`Synchronizing new ${flatCommits.length} commits...`),
    );

    flatCommits.forEach((commit) => {
      createCommit(
        { ...commit, author: config.author! },
        SYNC_REPO_PATH,
      );
    });

    await setHistory(history);
    await pushRepositoryChanges(SYNC_REPO_PATH);

    console.log(
      '\xa0🎉',
      colors.green(
        'All changes has been synchronized and pushed to your synching repository!',
      ),
    );
  });
