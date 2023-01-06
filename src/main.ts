import configuration from "./config.json" assert { type: "json" };
import { Command } from "./deps.ts";

import { configCommand } from "./commands/index.ts";

await new Command()
  .name(configuration.name)
  .version(configuration.version)
  .description(configuration.description)
  .action(() => console.log("Hello World, my name is Contribution Mate!"))
  .command("config", configCommand)
  .parse(Deno.args);
