import { join } from "path";
import { startDispatcher } from "queue";
import { watchEvm } from "watchEvm";
import { watchNeo } from "watchNeo";
import { database } from "./remotes";

require("dotenv").config({ path: join(__dirname, "../.env") });

async function main() {
  await database.initialize();
  await watchNeo();
  await startDispatcher();
  await watchEvm("polygon_mumbai");
}

main();
