import { ansi, colors, Command } from 'cliffy';
import { EOL } from 'std/fs';
import { VERSION } from 'version';
import { config } from 'commands/config';

await new Command()
  .name('contribution-mate')
  .version(VERSION)
  .description(
    'Sync your contributions from non-GitHub repos to your GitHub profile without revealing the source code or commit messages.',
  )
  .meta(
    'Create an alias',
    `
    ${EOL.LF}\xa0\xa0To create a short alias for contribution-mate, you can use ${
      ansi.link(
        colors.blue('GitHub CLI Aliases'),
        'https://cli.github.com/manual/gh_alias',
      )
    }.

  For example:
  gh alias set cm 'contribution-mate'
  gh cm --help`,
  )
  .action(function (this: Command) {
    this.showHelp();
  })
  .command(config.getName(), config)
  .parse(Deno.args);
