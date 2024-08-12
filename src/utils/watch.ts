import { NETWORKS } from "constants/networks";
import { BridgeBlockCacheEntity } from "entites/bridge-block-cache.entity";
import { getRepository } from "remotes/database";

export async function startTask(task: () => Promise<void>) {
  let isProcessing = false;
  setInterval(async () => {
    if (isProcessing) {
      return;
    }
    isProcessing = true;
    try {
      await task();
    } catch (e) {
      console.error(e);
    } finally {
      isProcessing = false;
    }
  }, 1000);
}

const repo = getRepository(BridgeBlockCacheEntity);
export async function watch(
  network: keyof typeof NETWORKS,
  task: (startBlockNumber: number) => Promise<number>
) {
  const cache =
    (await repo.findOneBy({ chainId: network })) ??
    new BridgeBlockCacheEntity();

  let startBlockNumber = cache.block || 0;
  startTask(async () => {
    startBlockNumber = await task(startBlockNumber);
    cache.chainId = network;
    cache.block = startBlockNumber;
    await repo.save(cache);
  });
}
