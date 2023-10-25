import { join } from "path";
import { watchEvm } from "watchEvm";
import { database } from "./remotes";
import { watchNeo } from "watchNeo";
import { startDispatcher } from "queue";

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
