import { Input, prompt, Toggle } from 'cliffy';
import {
  compose,
  endsWith,
  equals,
  ifElse,
  isEmpty,
  not,
  pipe,
  when,
} from 'rambda';
import {
  createRepository,
  getRepository,
  RepositoryError,
} from 'models/repository';
import {
  type AuthorLike,
  type ConfigLike,
  getAuthor,
  getConfig,
  getConfigPath,
  notifyConfigExists,
  writeConfig,
} from 'models/config';
import { getGitAuthor, type GitAuthorLike } from 'models/git';
import { exists, sanitizeString } from 'utils';

export async function configAction(): Promise<void> {
  const configured: boolean = await exists(getConfigPath());
  const _defaultAuthor: AuthorLike | GitAuthorLike = await ifElse(
    equals(true),
    pipe(notifyConfigExists, promptConfigUpdate, updateConfigOrExit),
    getGitAuthor,
  )(configured);

  const _defaultRepo: Partial<ConfigLike> = await ifElse(
    equals(true),
    getConfig,
    function () {
      return { repository: 'contribution-mate-sync' };
    },
  )(configured);

  const result = await prompt([
    {
      type: Input,
      name: 'name',
      message: 'Default commit author name:',
      hint: 'Different authors can be configured per repository later on.',
      transform: sanitizeString,
      validate: compose(not, isEmpty, sanitizeString),
      default: _defaultAuthor.name,
    },
    {
      type: Input,
      name: 'email',
      message: 'Default commit author email:',
      hint: 'Different emails can be configured per repository later on.',
      transform: sanitizeString,
      validate: compose(not, isEmpty, sanitizeString),
      default: _defaultAuthor.email,
      after: async ({ email }, next) => {
        when<string, void>(
          compose(not, endsWith('@users.noreply.github.com')),
          notifyEmailLeak,
        )(email ?? '');
        await next();
      },
    },
    {
      type: Input,
      name: 'repository',
      message: 'Base repository for synchorization:',
      hint:
        'If you already have a repository on GitHub that you use for synchorization, you can type it here, otherwise we will create a new one for you.',
      transform: sanitizeString,
      validate: compose(not, isEmpty, sanitizeString),
      default: _defaultRepo.repository,
      after: async (opts, next) => {
        try {
          const repository = await getRepository({
            name: opts.repository ?? '',
          });
          const confirmed = await Toggle.prompt({
            message: `You already have a ${
              repository.isPrivate ? 'private' : 'public'
            } repository named "${repository.name}", use it for synchronization?`,
            default: false,
          });

          if (!confirmed) return await next('repository');
          return await next();
        } catch (err) {
          if (!(err instanceof RepositoryError)) {
            console.error(err);
            Deno.exit(1);
          }

          const confirmed = await Toggle.prompt({
            message:
              `You don't have a repository named "${opts.repository}", create one?`,
            default: false,
          });

          if (!confirmed) return await next('repository');

          const repository = await createRepository({
            name: opts.repository ?? '',
          });

          console.log(
            `Your new sync repository is available here:\n${repository.url}`,
          );
        }
      },
    },
  ]);

  await writeConfig(result as ConfigLike);

  console.log('Done ✨');
}

function promptConfigUpdate(): Promise<boolean> {
  return Toggle.prompt({
    message: 'Would you like to make changes to your configuration?',
    default: false,
  });
}

async function updateConfigOrExit(
  confirmed: Promise<boolean>,
): Promise<AuthorLike> | never {
  return ifElse(
    equals(true),
    getAuthor,
    (): never => Deno.exit(0),
  )(await confirmed);
}

/**
 * TODO: Implement
 * Use ansi/tty for this.
 * And actually we should ansi/tty for all console logs.
 */
function notifyEmailLeak() {
  console.log(
    'Your email address might be leaked, advised to use GitHub no-reply',
  );
}
