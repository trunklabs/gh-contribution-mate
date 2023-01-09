export * from "./config.ts";

import { Command } from "../../deps.ts";
import { config } from "./config.ts";

export const configCmd = new Command()
  .description("Configure global setting")
  .action(config);
