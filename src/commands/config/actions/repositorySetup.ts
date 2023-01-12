import { Toggle } from "../../../deps.ts";
import { tryDecode } from "../../../utils/index.ts";

export const repositorySetup = async ({ repository }, next) => {
  const isRepoExists = await tryDecode([
    "gh",
    "repo",
    "view",
    `${repository}`,
  ], { silent: true });

  if (isRepoExists) {
    const confirmedRepoCreation = await Toggle.prompt(
      `We found this repository in your library, do you want to use "${repository}" repository for synchronization?`,
    );
    return confirmedRepoCreation ? await next() : await next("repository");
  }

  const createNewRepoConfirm = await Toggle.prompt(
    `We are about to create "${repository}" repository, check if the name looks correct?`,
  );

  if (createNewRepoConfirm) {
    const createdRepoLink = await tryDecode([
      "gh",
      "repo",
      "create",
      `${repository}`,
      "--private",
      "--description",
      "This is a private contribution-mate repository for you to synchronize all your commit history",
      "--disable-issues",
      "--add-readme",
    ]);
    console.log(
      `Here's a new "${repository}" repository for you ${createdRepoLink}`,
    );
    return next();
  }
  return next("repository");
};
