import { z } from 'zod';

export const AuthorSchema = z.object({
  name: z.string().trim(),
  email: z.string().email().trim(),
});

export type AuthorType = z.infer<typeof AuthorSchema>;

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
