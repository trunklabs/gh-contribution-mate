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

export const tryDecode = async (params: string[]) => {
  const process = Deno.run({
    cmd: params,
    stdout: "piped",
    stderr: "piped",
  });
  const { code } = await process.status();

  if (code !== 0) {
    const error = new TextDecoder().decode(await process.stderrOutput());
    console.error(
      `[%cERROR%c] Process failed with an error: ${error}`,
      "color: red",
      "color: inherit",
    );
  }
  return new TextDecoder().decode(await process.output()).toString().trim();
};
