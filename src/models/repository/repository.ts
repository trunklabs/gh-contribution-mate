import { z } from 'zod';
import { isEmpty, tryCatch } from 'rambda';
import { memoizy } from 'memoizy';

export class RepositoryError extends Error {
  constructor(message: string = 'Repository error') {
    super(message);
    this.name = this.constructor.name;
  }
}

export type Repository = z.infer<typeof Repository>;
export const Repository = z.object({
  name: z.string().trim(),
  isFork: z.boolean(),
  isPrivate: z.boolean(),
  url: z.string().trim().url(),
  isInOrganization: z.boolean(),
  owner: z.object({
    login: z.string().trim().min(1),
  }),
});

export function isRepository(obj: unknown): obj is Repository {
  try {
    Repository.parse(obj);
    return true;
  } catch (_) {
    return false;
  }
}

function constructRepositoryObj(
  { name, isFork, isPrivate, url, isInOrganization, owner }: Repository,
): Repository {
  return {
    name,
    isFork,
    isPrivate,
    url,
    isInOrganization,
    owner: { login: owner.login },
  };
}

// ? Probably not the right place for it. New user model?
async function getUsername() {
  const proc = Deno.run({
    cmd: ['bash'],
    stdin: 'piped',
    stdout: 'piped',
    stderr: 'piped',
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  await proc.stdin.write(encoder.encode(`gh api user`));
  await proc.stdin.close();
  const stderr = decoder.decode(await proc.stderrOutput()).trim();
  proc.close();

  if (!isEmpty(stderr)) {
    throw new Error(stderr);
  }

  const { login: username } = JSON.parse(
    decoder.decode(await proc.output()).trim(),
  );
  return username;
}

export const getRepository = memoizy(
  async ({ name }: Pick<Repository, 'name'>): Promise<Repository> => {
    /**
     * Be aware that json options are not type-safe at the moment.
     * In case a change is needed make sure this is aligned with the `Repository` type.
     */
    const proc = Deno.run({
      cmd: [
        'gh',
        'repo',
        'view',
        name,
        '--json',
        'isFork,isPrivate,name,url,isInOrganization,owner',
      ],
      stdout: 'piped',
      stderr: 'piped',
    });
    const decoder = new TextDecoder();
    const stdout = decoder.decode(await proc.output()).trim();
    const stderr = decoder.decode(await proc.stderrOutput()).trim();

    proc.close();

    /**
     * In case there's an unexpected error from the `gh` command, we want to stop the execution completely.
     */
    if (!isEmpty(stderr) && !stderr.includes(name)) {
      console.error('ERROR', stderr);
      Deno.exit(1);
    }

    /**
     * In case the repository doesn't exist, we want to throw an error.
     */
    if (!isEmpty(stderr) && stderr.includes(name)) {
      throw new RepositoryError('Repository not found');
    }

    /**
     * In case the repository exists, we want to parse the JSON response and cache it.
     * If the parsing fails, we want to stop the execution completely.
     */
    const obj: unknown = tryCatch(JSON.parse, () => {
      console.error('ERROR', 'Failed to parse JSON response');
      Deno.exit(1);
    })(stdout);

    const username = await getUsername();

    if (
      !isRepository(obj) || obj.isFork || obj.isInOrganization ||
      obj.owner.login !== username
    ) {
      console.error(
        'ERROR',
        'Invalid repository - this repository cannot be used',
        '\n',
        'Make sure the repository is not a fork, not in an organization and belongs to the current user',
      );
      throw new RepositoryError('Invalid repository');
    }

    return constructRepositoryObj(obj);
  },
);

export async function createRepository(
  { name }: Pick<Repository, 'name'>,
): Promise<Repository> {
  const proc = Deno.run({
    cmd: [
      'gh',
      'repo',
      'create',
      name,
      '--private',
      '--description',
      'Sync repository for contribution-mate',
    ],
    stdout: 'piped',
    stderr: 'piped',
  });

  const { success } = await proc.status();
  const stdout = new TextDecoder().decode(await proc.output()).trim();

  proc.close();

  if (!success || !stdout.includes(name)) {
    console.error('ERROR', 'Failed to create a new repository');
    Deno.exit(1);
  }

  return getRepository({ name });
}
