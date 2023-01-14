/**
 * Will check if a file or directory exists.
 */
export const exists = async (path: string): Promise<boolean> => {
  try {
    await Deno.stat(path);
    return true;
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return false;
    }
    throw e;
  }
};
