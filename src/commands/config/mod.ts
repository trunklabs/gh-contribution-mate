import { Command } from 'cliffy';
import { configAction } from './config.ts';

export const config = new Command()
  .name('config')
  .description('Setup and update global configuration.')
  .action(configAction);
