import { join } from "path";
import { startDispatcher } from "queue";
import { watchEvm } from "watchEvm";
import { watchNeo } from "watchNeo";
import { database } from "./remotes";

require("dotenv").config({ path: join(__dirname, "../.env") });

async function main() {
  await database.initialize();
  await startDispatcher();
  await watchNeo();
  await watchEvm("polygon_mumbai");
  await watchEvm("eth_goril");
  await watchEvm("bsc_testnet");
}

main();
