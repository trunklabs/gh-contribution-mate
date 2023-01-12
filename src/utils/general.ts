import { ensureFile } from "../deps.ts";

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

interface DecodeParams {
  silent: boolean;
}

export const tryDecode = async (params: string[], options?: DecodeParams) => {
  const process = Deno.run({
    cmd: params,
    stdout: "piped",
    stderr: "piped",
  });

  if (!options?.silent) {
    const { code } = await process.status();
    if (code !== 0) {
      const error = new TextDecoder().decode(await process.stderrOutput());
      console.error(
        `[%cERROR%c] Process failed with an error: ${error}`,
        "color: red",
        "color: inherit",
      );
    }
  }

  return new TextDecoder().decode(await process.output()).toString().trim();
};

export const createFile = async (data, path: string) => {
  const userDataJson = JSON.stringify(data, null, 2);
  const userDataString = userDataJson.toString();
  const encoder = new TextEncoder();
  const encodedUser = encoder.encode(userDataString);
  await ensureFile(path);
  await Deno.writeFile(path, encodedUser);
};
