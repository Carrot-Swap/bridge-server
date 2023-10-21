import { join } from "path";
import { database } from "./remotes";
import { watchNeo } from "watchNeo";

require("dotenv").config({ path: join(__dirname, "../.env") });

async function main() {
  await database.initialize();
  await watchNeo();
}

main();
