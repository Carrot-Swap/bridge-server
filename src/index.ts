import { join } from "path";
import { startDispatcher } from "queue";
import { watchNeo } from "watchNeo";
import { database } from "./remotes";

require("dotenv").config({ path: join(__dirname, "../.env") });

async function main() {
  await database.initialize();
  await watchNeo();
  await startDispatcher();
}

main();
