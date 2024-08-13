import { sleep } from "./sleep";

export async function startJob(task: () => Promise<void>) {
  do {
    await task().catch(console.error);
    await sleep(1000);
  } while (true);
}
