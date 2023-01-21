import { join } from 'std/path';
import { colors } from 'cliffy';
import { default as dir } from 'dir';
import { z } from 'zod';

/**
 * TODO: Improve
 * We have two AuthorLike types, one in models/git and one here.
 * Would be nice to have one type for both, or at least a common interface.
 */
export type AuthorLike = {
  name: string;
  email: string;
};

export type ConfigLike = {
  name: string;
  email: string;
  repository: string;
};

export const configSchema = z.object({
  name: z.string(),
  email: z.string(),
  repository: z.string(),
});

export function getConfigDir() {
  const base = 'contribution-mate';

  /**
   * On macOS the default behavior is to store config files in $HOME/Library/Preferences,
   * but this is not a good practice for CLI tools, so we use $XDG_CONFIG_HOME or $HOME instead.
   */
  if (Deno.build.os === 'darwin') {
    const home = Deno.env.get('XDG_CONFIG_HOME') ??
      join(dir('home') as string, '.config');
    return join(home, base);
  }

  return join(dir('config') as string, base);
}

export function getConfigPath() {
  return join(getConfigDir(), 'config.json');
}

export async function getConfig(): Promise<ConfigLike> {
  const data = JSON.parse(await Deno.readTextFile(getConfigPath()));
  const config = configSchema.parse(data);
  return config;
}

/**
 * TODO: Implement
 * Get author from the config.
 */
export async function getAuthor(): Promise<AuthorLike> {
  const { name, email }: Partial<ConfigLike> = await getConfig();
  return { name, email };
}

export function notifyConfigExists() {
  console.log(
    colors.green('\xa0\u2713'),
    colors.green('You have already configured contribution-mate!'),
  );
}

/**
 * TODO: Implement
 * Write config to disk in JSON format.
 * If exists - update it.
 */
export async function writeConfig(config: ConfigLike): Promise<ConfigLike> {
  return await Promise.resolve(config);
}
