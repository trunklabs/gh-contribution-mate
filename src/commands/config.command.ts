import { Command, ensureFile, Input, prompt } from "../deps.ts";
import dir from "https://deno.land/x/dir@1.5.1/mod.ts";
import { fileExists, isNotEmpty, runCli } from "../helpers/index.ts";

export const configCommand = new Command()
  .description("contribution-mate configuration")
  .action(async () => {
    const rootDir = dir("config");
    const userConfig = `${rootDir}/contribution-mate/user.json`;

    const isFileCreated = await fileExists(userConfig);

    const userName = await runCli("git config --global user.name");
    const userEmail = await runCli("git config --global user.email");

    const userPrompt = await prompt([
      {
        name: "name",
        message: "Commit authoring name",
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
            console.log("Lets update your credentials");
            await next();
          } else {
            console.log("Lets setup your credentials at first");
            await next();
          }
        },
      },

      {
        name: "email",
        message: "Commit authoring email",
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

    console.log("Setup is done");
  });
