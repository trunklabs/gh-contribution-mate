import { z } from 'zod';

export const AuthorSchema = z.object({
  name: z.string().min(1).trim(),
  email: z.string().email().trim(),
});
export const CommitSchema = z.object({
  hash: z.string().min(1).trim(),
  timestamp: z.number().int().positive(),
});

export type AuthorType = z.infer<typeof AuthorSchema>;
export type CommitType = z.infer<typeof CommitSchema>;

async function getGitConfigParam(key: string): Promise<string | undefined> {
  const cmd = new Deno.Command('git', {
    args: ['config', '--global', key],
  });

  const cmdOutput = await cmd.output();

  if (cmdOutput.code !== 0) throw new TextDecoder().decode(cmdOutput.stderr);

  const result = new TextDecoder().decode(await cmdOutput.stdout).trim();

  return result;
}

export async function getAuthors(repoPath: string): Promise<AuthorType[]> {
  const getDefaultBranchCmd = new Deno.Command('git', {
    args: ['symbolic-ref', 'refs/remotes/origin/HEAD'],
    cwd: repoPath,
  });

  const defaultBranchCmdOutput = await getDefaultBranchCmd.output();

  if (defaultBranchCmdOutput.code !== 0) {
    throw new TextDecoder().decode(defaultBranchCmdOutput.stderr);
  }

  const defaultBranch = new TextDecoder().decode(defaultBranchCmdOutput.stdout)
    .trim().split('/').pop() ?? 'main';

  const getAuthorsCmd = new Deno.Command('git', {
    args: ['log', defaultBranch, '--format=%aN <%aE>'],
    cwd: repoPath,
  });

  const authorsCmdOutput = await getAuthorsCmd.output();

  if (authorsCmdOutput.code !== 0) {
    throw new TextDecoder().decode(defaultBranchCmdOutput.stderr);
  }

  const rawAuthors: string[] = new TextDecoder().decode(authorsCmdOutput.stdout)
    .trim().split('\n');

  const authors: AuthorType[] = rawAuthors.concat().sort().reduce(
    (acc, curr) => {
      const [name, email] = curr.split(' <').map((str) => str.replace('>', ''));
      const existingAuthor = acc.find((author) => author.email == email);
      if (existingAuthor) return acc;

      acc.push({ name, email });

      return acc;
    },
    [] as AuthorType[],
  );

  return authors;
}

export async function getGitAuthor(): Promise<AuthorType | undefined> {
  const name = await getGitConfigParam('user.name');
  const email = await getGitConfigParam('user.email');

  try {
    return AuthorSchema.parse({ name, email });
  } catch (_) { // todo: debugger
    return;
  }
}

/**
 * Returns a list of commits authored by the given email in reverse chronological order.
 * @param {string} email
 * @returns {Promise<CommitType[]>}
 */
export async function getCommitsByEmail(email: string): Promise<CommitType[]> {
  const cmd = new Deno.Command('git', {
    args: [
      'log',
      `--author=${email}`,
      '--pretty=format:%H|%cd',
      '--date=format-local:%s',
    ],
  });

  const cmdOutput = await cmd.output();

  if (cmdOutput.code !== 0) throw new TextDecoder().decode(cmdOutput.stderr);

  return new TextDecoder().decode(await cmdOutput.stdout).trim().split(
    '\n',
  ).map((line) => {
    const [hash, timestamp] = line.split('|');
    return { hash, timestamp: parseInt(timestamp) };
  });
}
