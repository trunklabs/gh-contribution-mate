import { EOL } from 'std/fs';
import { basename } from 'std/path';
import { Checkbox, colors, Command } from 'cliffy';
import { logger } from 'lib';
import { getConfig, RepoType, setConfig } from '../config.ts';
import { getAuthors } from '../git.ts';

export default new Command()
  .description('Add one or more local repositories for syncing.')
  .arguments('<...repositories:string>')
  .option('-d, --debug', 'Enable debug output.')
  .action(async ({ debug }, ...repoPaths) => {
    if (debug) logger.enable();

    logger.info('Adding following repositories:', repoPaths);
    const config = await getConfig();

    logger.info('Current config:', config);
    const mutableConfig = { ...config };

    for (const repoPath of repoPaths) {
      const authors = await getAuthors(repoPath);
      logger.info('Authors:', authors);

      const selectedAuthors: string[] = await Checkbox.prompt({
        message: `Select authors of commits to extract from the "${
          basename(repoPath)
        } repository". Use arrow keys for navigation, space to select, and enter to submit.`,
        options: authors.map((author) => `${author.name} <${author.email}>`),
      });
      logger.info('Selected authors:', selectedAuthors);

      const repo: RepoType = {
        dir: repoPath,
        authors: authors.filter((author) =>
          selectedAuthors.includes(`${author.name} <${author.email}>`)
        ),
      };
      logger.info('Repository details:', repo);

      mutableConfig.repos[basename(repoPath)] = repo;
    }

    logger.info('Setting new config:', mutableConfig);
    await setConfig(mutableConfig);

    console.log(
      '\xa0🎉',
      colors.green('You are all set!'),
      EOL.LF,
      colors.green('ℹ️\xa0'),
      colors.green(
        'You can run the "sync" command to synchronize your commits now.',
      ),
      colors.green('See more information with the "--help" flag.'),
    );
  });
