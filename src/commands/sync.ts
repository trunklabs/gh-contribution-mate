import { Command } from 'cliffy';
import { ghNoReplyCheck, promptAllInputs, validate } from 'lib';
import {
  getConfig,
  getHistory,
  HistoryType,
  setConfig,
  setHistory,
} from '../config.ts';
import {
  AuthorSchema,
  AuthorType,
  getCommitsByEmail,
  getGitAuthor,
} from '../git.ts';

export default new Command()
  .description('Synchronize commits from local repositories to GitHub profile.')
  .action(async () => {
    const config = await getConfig();

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
      setConfig({ author });
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

    setHistory(history);
  });
