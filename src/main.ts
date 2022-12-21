import config from "./config.json" assert { type: "json" };
import { Command } from "./deps.ts";

await new Command()
  .name(config.name)
  .version(config.version)
  .description(config.description)
  .action(() => console.log("Hello World, my name is Contribution Mate!"))
  .parse(Deno.args);
