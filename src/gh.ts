import { z } from 'zod';

export const RepositorySchema = z.object({
  id: z.string().trim(),
  name: z.string().trim(),
  owner: z.object({
    id: z.string().trim(),
    login: z.string().trim(),
  }),
});
export type RepositoryType = z.infer<typeof RepositorySchema>;

export async function getRepositories(): Promise<RepositoryType[]> {
  const cmd = new Deno.Command('gh', {
    args: [
      'repo',
      'list',
      '--source',
      '--private=false',
      '--no-archived',
      '--json',
      'id,name,owner',
    ],
  });

  const cmdOutput = await cmd.output();

  if (cmdOutput.code !== 0) throw new TextDecoder().decode(cmdOutput.stderr);

  const stdout = new TextDecoder().decode(await cmdOutput.stdout).trim();
  return z.array(RepositorySchema).parse(JSON.parse(stdout));
}

export async function cloneRepository(
  repository: RepositoryType,
  name: string,
  cwd: string,
): Promise<void> {
  const cmd = new Deno.Command('gh', {
    args: ['repo', 'clone', repository.name, name],
    cwd,
  });

  const cmdOutput = await cmd.output();

  if (cmdOutput.code !== 0) throw new TextDecoder().decode(cmdOutput.stderr);
}

export async function pullRepositoryChanges(
  cwd: string,
): Promise<void> {
  try {
    const cmd = new Deno.Command('gh', {
      args: ['repo', 'sync'],
      cwd,
    });

    const cmdOutput = await cmd.output();

    if (cmdOutput.code !== 0) throw new TextDecoder().decode(cmdOutput.stderr);
  } catch (err) {
    // with a clean repo there are no changes to pull yet
    if (typeof err != 'string' || !err.includes('invalid refspec')) throw err;
  }
}
