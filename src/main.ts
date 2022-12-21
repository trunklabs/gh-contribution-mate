import { Command } from "./deps.ts";

await new Command()
  .name("contribution-mate")
  .version("0.1.0")
  .description(
    "Contribution Mate is a GitHub CLI extension that allows you to safely synchronize your commit history of non-GitHub repositories with your GitHub account without fear of exposing the source code."
  )
  .action(() => console.log("Hello World, my name is Contribution Mate!"))
  .parse(Deno.args);
