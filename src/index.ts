import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import { join } from "path";
import { watchEvm } from "watchEvm";
import { watchNeo } from "watchNeo";
import { database } from "./remotes";
import { startDispatcher } from "queue";

require("dotenv").config({ path: join(__dirname, "../.env") });

async function main() {
  Sentry.init({
    dsn: "https://eaeb6834416454178437ad65132b7f70@o4506154701750272.ingest.sentry.io/4506154704240640",
    integrations: [new ProfilingIntegration()],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });

  await database.initialize();
  await startDispatcher();
  await watchNeo();
  await watchEvm("polygon_mumbai");
  await watchEvm("eth_sepolia");
  await watchEvm("bsc_testnet");
}

main().catch(Sentry.captureException);
