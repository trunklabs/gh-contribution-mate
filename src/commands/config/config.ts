import { dir, Input, prompt } from "../../deps.ts";
import {
  createFile,
  fileExists,
  isNotEmpty,
  tryDecode,
} from "../../utils/index.ts";
import { nameSetup, repositorySetup } from "./actions/index.ts";

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
      message: "Default commit author:",
      hint:
        "you will have the option to use a different name per repository (when you connect one)",
      type: Input,
      validate: (value) => isNotEmpty(value),
      default: userName,
      before: (_, next) => nameSetup(userName, userEmail, isFileCreated, next),
    },

    {
      name: "email",
      message: "Default commit author's email:",
      hint:
        "you will have the option to use a different email address per repository (when you connect one)",
      type: Input,
      validate: (value) => isNotEmpty(value),
      default: userEmail,
    },

    {
      name: "repository",
      message: "Default repository name:",
      type: Input,
      validate: (value) => isNotEmpty(value),
      default: "contribution-mate-sync",
      after: (opts, next) => repositorySetup(opts, next),
    },
  ]);

  await createFile(userPrompt, userConfig);

  console.log("Done ✨");
};
