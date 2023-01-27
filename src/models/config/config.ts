import { join } from 'std/path';
import { colors } from 'cliffy';
import { default as dir } from 'dir';
import { z } from 'zod';

export type Config = z.infer<typeof Config>;
export const Config = z.object({
  name: z.string().trim().min(1),
  email: z.string().email().trim(),
  repository: z.string().trim().regex(/^[a-zA-Z0-9-_.]+$/),
});

export function getConfigDir(): string {
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

export function getConfigPath(): string {
  return join(getConfigDir(), 'config.json');
}

export async function getConfig(): Promise<Config> {
  const obj: unknown = JSON.parse(
    await Deno.readTextFile(getConfigPath()),
  );
  return Config.parse(obj);
}

export function notifyConfigExists(): void {
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
export async function writeConfig(config: Config): Promise<Config> {
  return await Promise.resolve(config);
}
