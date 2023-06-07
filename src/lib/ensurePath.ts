import { exists } from './exists.ts';

export async function ensurePath(path: string): Promise<void> {
  const pathExists = await exists(path);
  if (!pathExists) await Deno.mkdir(path, { recursive: true });
}
