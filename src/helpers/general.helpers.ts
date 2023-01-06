export const fileExists = async (file: string): Promise<boolean> => {
  try {
    await Deno.stat(file);
    return true;
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return false;
    }
    throw e;
  }
};

export async function runCli(params: string) {
  const props = params.split(" ");

  const process = Deno.run({
    cmd: props,
    stdout: "piped",
    stderr: "piped",
  });

  const { code } = await process.status();
  if (code === 0) {
    return new TextDecoder().decode(await process.output()).trim();
  } else {
    const error = new TextDecoder().decode(await process.stderrOutput());
    console.error(error);
  }
}
