export type GitAuthorLike = {
  name: string;
  email: string;
};

export async function getGitAuthor(): Promise<GitAuthorLike> {
  const [name, email] = await Promise.all(['name', 'email'].map(async (key) => {
    const proc = Deno.run({
      cmd: ['git', 'config', '--global', `user.${key}`],
      stdout: 'piped',
    });
    const { success } = await proc.status();
    if (!success) return '';
    return new TextDecoder().decode(await proc.output()).trim();
  }));

  return { name, email };
}
