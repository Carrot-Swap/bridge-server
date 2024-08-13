import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import { join } from "path";
import { watchEvm } from "watchEvm";
import { startDispatcher } from "worker/queue";
import { database } from "./remotes";

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
  await startDispatcher(false);
  // await watchEvm(47763);
  // await watchEvm(1);
  await watchEvm(137);
  // await watchEvm(56);
  // await watchEvm(42161);
}

main().catch((e) => {
  Sentry.captureException(e);
  throw e;
});
