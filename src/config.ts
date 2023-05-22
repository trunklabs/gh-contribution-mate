import { z } from 'zod';
import { join } from 'std/path';
import { default as dir } from 'dir';
import { mergeDeepRight } from 'rambda';
import { ensurePath, exists } from 'lib';
import { AuthorSchema, CommitSchema } from './git.ts';

const RepoSchema = z.object({
  dir: z.string(),
  authors: z.array(AuthorSchema),
});
const ConfigSchema = z.object({
  author: AuthorSchema.optional(),
  repos: z.record(RepoSchema),
});
const HistorySchema = z.record(
  z.record(
    z.array(
      CommitSchema.optional(),
    ).optional(),
  ).optional(),
);

export type RepoType = z.infer<typeof RepoSchema>;
export type ConfigType = z.infer<typeof ConfigSchema>;
export type HistoryType = z.infer<typeof HistorySchema>;

function createDefaultConfig(): ConfigType {
  return {
    repos: {},
  };
}

function getConfigDir(): string {
  const base = 'contribution-mate';

  /**
   * On macOS the default behavior is to store config files in $HOME/Library/Preferences,
   * but this is not a good practice for CLI tools, so we use $XDG_CONFIG_HOME or $HOME/.config instead.
   */
  if (Deno.build.os === 'darwin') {
    const home = Deno.env.get('XDG_CONFIG_HOME') ??
      join(dir('home') as string, '.config');
    return join(home, base);
  }

  return join(dir('config') as string, base);
}

function getConfigPath(): string {
  return join(getConfigDir(), 'config.json');
}

function getHistoryPath(): string {
  return join(getConfigDir(), 'history.json');
}

async function ensureConfigFile(): Promise<void> {
  await ensurePath(getConfigDir());
  const configPath = getConfigPath();
  const configExists = await exists(configPath);
  const defaultConfig = createDefaultConfig();
  if (!configExists) {
    await Deno.writeTextFile(
      configPath,
      JSON.stringify(defaultConfig, null, 2),
    );
  }
}

async function ensureHistoryFile(): Promise<void> {
  await ensurePath(getConfigDir());
  const historyPath = getHistoryPath();
  const historyExists = await exists(historyPath);
  if (!historyExists) {
    await Deno.writeTextFile(
      historyPath,
      JSON.stringify({}, null, 2),
    );
  }
}

export async function getConfig(): Promise<ConfigType> {
  await ensureConfigFile();
  const configPath = getConfigPath();

  const obj: unknown = JSON.parse(await Deno.readTextFile(configPath));
  return ConfigSchema.parse(obj);
}

export async function setConfig(
  config: Partial<ConfigType>,
): Promise<ConfigType> {
  const currentConfig = await getConfig();

  const mergedConfig = mergeDeepRight<ConfigType>(
    ConfigSchema.parse(currentConfig),
    ConfigSchema.partial().parse(config),
  );

  await Deno.writeTextFile(
    getConfigPath(),
    JSON.stringify(mergedConfig, null, 2),
  );

  return mergedConfig;
}

export async function getHistory(): Promise<HistoryType> {
  await ensureHistoryFile();
  const historyPath = getHistoryPath();

  const obj: unknown = JSON.parse(await Deno.readTextFile(historyPath));
  return HistorySchema.parse(obj);
}

export async function setHistory(
  history: Partial<HistoryType>,
): Promise<HistoryType> {
  const currentHistory = await getHistory();

  // todo: merge in reverse order by commit timestamp

  const mergedHistory = mergeDeepRight<HistoryType>(
    HistorySchema.parse(currentHistory),
    HistorySchema.parse(history),
  );

  await Deno.writeTextFile(
    getHistoryPath(),
    JSON.stringify(mergedHistory, null, 2),
  );

  return mergedHistory;
}
