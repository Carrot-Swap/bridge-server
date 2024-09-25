import { sleep } from "./sleep";

export async function startJob(task: () => Promise<void>, time = 1000) {
  do {
    await task().catch(console.error);
    await sleep(time);
  } while (true);
}
