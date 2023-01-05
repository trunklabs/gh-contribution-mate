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
