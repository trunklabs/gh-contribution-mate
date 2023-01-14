import { isEmpty, tryCatch } from 'rambda';

export class RepositoryError extends Error {
  constructor(message: string = 'Repository error') {
    super(message);
    this.name = this.constructor.name;
  }
}

export type RepositoryLike = {
  name: string;
  isFork: boolean;
  isPrivate: boolean;
  url: string;
};

export function isRepository(obj: unknown): obj is RepositoryLike {
  return typeof obj === 'object' && obj !== null && 'name' in obj &&
    'isFork' in obj && 'isPrivate' in obj && 'url' in obj;
}

let cachedRepository: RepositoryLike | null = null;

function setCachedRepository(
  { name, isFork, isPrivate, url }: RepositoryLike,
): RepositoryLike {
  cachedRepository = { name, isFork, isPrivate, url };
  return cachedRepository;
}

export async function getRepository(
  { name }: Pick<RepositoryLike, 'name'>,
): Promise<RepositoryLike> {
  if (cachedRepository && cachedRepository.name === name) {
    return cachedRepository;
  }

  const proc = Deno.run({
    cmd: ['gh', 'repo', 'view', name, '--json', 'isFork,isPrivate,name,url'],
    stdout: 'piped',
    stderr: 'piped',
  });
  const stdout = new TextDecoder().decode(await proc.output()).trim();
  const stderr = new TextDecoder().decode(await proc.stderrOutput()).trim();

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
  const obj = tryCatch(JSON.parse, () => {
    console.error('ERROR', 'Failed to parse JSON response');
    Deno.exit(1);
  })(stdout);

  if (!isRepository(obj) || obj.isFork) {
    console.error(
      'ERROR',
      'Invalid repository - this repository cannot be used',
      '\n',
      'Make sure the repository is not a fork',
    );
    throw new RepositoryError('Invalid repository');
  }

  return setCachedRepository(obj);
}

export async function createRepository(
  { name }: Pick<RepositoryLike, 'name'>,
): Promise<RepositoryLike> {
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

  if (!success || !stdout.includes(name)) {
    console.error('ERROR', 'Failed to create a new repository');
    Deno.exit(1);
  }

  return getRepository({ name });
}
