import { ansi, colors, Input, prompt, Toggle } from 'cliffy';
import { EOL } from 'std/fs';
import { compose, endsWith, equals, ifElse, not, pipe, when } from 'rambda';
import {
  createRepository,
  getRepository,
  RepositoryError,
} from 'models/repository';
import {
  Config,
  getConfig,
  getConfigPath,
  notifyConfigExists,
  writeConfig,
} from 'models/config';
import { getGitAuthor, GitAuthor } from 'models/git';
import { exists, sanitizeString, validate } from 'utils';

export async function configAction(): Promise<void> {
  const config: Config = await ifElse(
    equals(true),
    pipe(notifyConfigExists, promptConfigUpdate, getConfigOrExit),
    getDefaultConfig,
  )(await exists(getConfigPath()));

  const result: Config = await prompt([
    {
      type: Input,
      name: 'name',
      message: 'Default commit author name:',
      hint: 'Different authors can be configured per repository later on.',
      transform: sanitizeString,
      validate: compose(validate(Config.shape.name.parse), sanitizeString),
      default: config.name,
    },
    {
      type: Input,
      name: 'email',
      message: 'Default commit author email:',
      hint: 'Different emails can be configured per repository later on.',
      transform: sanitizeString,
      validate: compose(validate(Config.shape.email.parse), sanitizeString),
      default: config.email,
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
      message: 'Base repository for synchronization:',
      hint:
        'If you already have a repository on GitHub that you use for synchronization, you can type it here, otherwise we will create a new one for you.',
      transform: sanitizeString,
      validate: compose(
        validate(Config.shape.repository.parse),
        sanitizeString,
      ),
      default: config.repository,
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
              `You don't have a repository named "${opts.repository}", create it?`,
            default: false,
          });

          if (!confirmed) return await next('repository');

          getRepository.delete({ name: opts.repository ?? '' });
          const repository = await createRepository({
            name: opts.repository ?? '',
          });

          console.log(
            colors.green('\xa0\u2713'),
            'Repository named',
            `"${ansi.link(colors.blue(repository.name), repository.url)}"`,
            'has been created and ready for use.',
          );
        }
      },
    },
  ]);

  await writeConfig(result);

  console.log(
    '\xa0🎉',
    colors.green('You are all set!'),
    EOL.LF,
    colors.green('ℹ️\xa0'),
    colors.green(
      'You can add local repositories for synchronization with the "add" command.',
    ),
    colors.green('See more information with the "help" command.'),
  );
}

async function getDefaultConfig(): Promise<Config> {
  const { name = '', email = '' }: GitAuthor = await getGitAuthor();
  const repository = 'contribution-mate-sync';

  return { name, email, repository };
}

function promptConfigUpdate(): Promise<boolean> {
  return Toggle.prompt({
    message: 'Would you like to make changes to your configuration?',
    default: false,
  });
}

async function getConfigOrExit(
  confirmed: Promise<boolean>,
): Promise<Config> | never {
  return ifElse(
    equals(true),
    getConfig,
    (): never => Deno.exit(0),
  )(await confirmed);
}

function notifyEmailLeak() {
  console.log(
    colors.yellow('\xa0!'),
    colors.yellow(
      'It looks like you are using your personal email address for commits authoring.',
    ),
    EOL.LF,
    '\xa0',
    colors.yellow('We encourage you to configure the'),
    ansi.link(
      'GitHub no-reply',
      'https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-email-preferences/setting-your-commit-email-address',
    ).toString(),
    colors.yellow('email address instead.'),
    EOL.LF,
    '\xa0',
    colors.yellow(
      'This will avoid the potential leaking of your email address.',
    ),
  );
}
