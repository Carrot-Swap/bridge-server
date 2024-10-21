import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import { getSignerAddress } from "constants/env";
import { ChainId } from "constants/networks";
import { join } from "path";
import { watchEvm } from "watchEvm";
import { startAnomalyMonitor } from "worker/annomalyMonitor";
import { startDispatcher } from "worker/queue";
import { SEND_MESSAGE } from "./env";
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

  console.log("start", getSignerAddress());

  await Promise.all([
    startDispatcher(
      [47763, 137, 56, ChainId.ARBITRUM, ChainId.BASE, ChainId.ETHEREUM],
      SEND_MESSAGE()
    ),
    watchEvm(47763, SEND_MESSAGE()),
    watchEvm(56, SEND_MESSAGE()),
    watchEvm(137, SEND_MESSAGE()),
    watchEvm(ChainId.ARBITRUM, SEND_MESSAGE()),
    watchEvm(ChainId.BASE, SEND_MESSAGE()),
    watchEvm(ChainId.ETHEREUM, SEND_MESSAGE()),
    startAnomalyMonitor(),
    // await watchEvm(1);
    // await watchEvm(42161);
  ]);
}

main().catch((e) => {
  Sentry.captureException(e);
  throw e;
});
