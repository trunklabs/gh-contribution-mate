import { Checkbox, colors, Command } from 'cliffy';
import { basename } from 'std/path';
import { EOL } from 'std/fs';
import { getConfig, type RepoType, setConfig } from '../config.ts';
import { getAuthors } from '../git.ts';

export default new Command()
  .description('Add one or more local repositories for syncing.')
  .arguments('<...repositories:string>')
  .option('-e, --email <email:string>', 'Email to sync', { collect: true })
  .action(async (_, ...repoPaths) => {
    const config = await getConfig();

    for (const repoPath of repoPaths) {
      const authors = await getAuthors(repoPath);

      const selectedAuthors: string[] = await Checkbox.prompt({
        message: `Select authors of commits to extract from the "${
          basename(repoPath)
        } repository". Use arrow keys for navigation, space to select, and enter to submit.`,
        options: authors.map((author) => `${author.name} <${author.email}>`),
        minOptions: 1,
      });

      const repo: RepoType = {
        dir: repoPath,
        authors: authors.filter((author) =>
          selectedAuthors.includes(`${author.name} <${author.email}>`)
        ),
      };

      config.repos[basename(repoPath)] = repo;
    }

    await setConfig(config);

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

/**
 * TODO: Run the sync
 * * 1. If this is the first repo - ask for email and name to use in the sync repo for commits
 */
