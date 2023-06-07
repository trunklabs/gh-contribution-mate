import { Command } from 'cliffy';
import { VERSION } from 'version';
import add from './commands/add.ts';
import sync from './commands/sync.ts';

await new Command()
  .name('contribution-mate')
  .version(VERSION)
  .description(
    'Synchronize your contributions from local repositories to your GitHub profile without revealing the source code or commit messages.',
  )
  .action(function (this: Command) {
    this.showHelp();
  })
  .command('add', add)
  .command('sync', sync)
  .parse(Deno.args);
