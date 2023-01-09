import { dir, ensureFile, Input, prompt } from "../../deps.ts";
import { fileExists, isNotEmpty, tryDecode } from "../../utils/index.ts";

export const config = async () => {
  const rootDir = dir("config");
  const userConfig = `${rootDir}/contribution-mate/user.json`;

  const isFileCreated = await fileExists(userConfig);

  const userName = await tryDecode([
    "git",
    "config",
    "--global",
    "user.name",
  ]);

  const userEmail = await tryDecode([
    "git",
    "config",
    "--global",
    "user.email",
  ]);

  const userPrompt = await prompt([
    {
      name: "name",
      message: "Default commit author",
      hint:
        "you will have the option to use a different name per repository (when you connect one)",
      type: Input,
      validate: (value) => isNotEmpty(value),
      default: userName,

      before: async (_, next) => {
        if (!userName || !userEmail) {
          console.log(
            "Probably you don't have git installed or configured on your machine. \nPlease install git or configure it at first then try again.",
          );
          return Deno.exit(1);
        }

        if (isFileCreated) {
          console.log(
            "You have previously configured Contribution Mate, you can update the current configuration",
          );
          await next();
        } else {
          console.log("Lets setup your credentials at first");
          await next();
        }
      },
    },

    {
      name: "email",
      message: "Default commit author's email",
      hint:
        "you will have the option to use a different email address per repository (when you connect one)",
      type: Input,
      validate: (value) => isNotEmpty(value),
      default: userEmail,
    },
  ]);

  const userDataJson = JSON.stringify(userPrompt, null, 2);
  const userDataString = userDataJson.toString();
  const encoder = new TextEncoder();
  const encodedUser = encoder.encode(userDataString);
  await ensureFile(userConfig);
  await Deno.writeFile(userConfig, encodedUser);

  console.log("Done ✨");
};
