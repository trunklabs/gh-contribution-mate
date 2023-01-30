import { z } from 'zod';
import { isEmpty } from 'rambda';

export type GitAuthor = z.infer<typeof GitAuthor>;
export const GitAuthor = z.object({
  name: z.string().trim().optional(),
  email: z.string().email().trim().optional(),
});

async function getGitConfigParam(key: string): Promise<string | undefined> {
  const proc = Deno.run({
    cmd: ['git', 'config', '--global', key],
    stdout: 'piped',
  });
  const { success } = await proc.status();

  if (!success) {
    proc.close();
    return;
  }

  const result = new TextDecoder().decode(await proc.output()).trim();
  proc.close();
  if (isEmpty(result)) return;
  return result;
}

export async function getGitAuthor(): Promise<GitAuthor> {
  return GitAuthor.parse({
    name: await getGitConfigParam('user.name'),
    email: await getGitConfigParam('user.email'),
  });
}
