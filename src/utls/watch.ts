import { BridgeBlockCacheEntity } from "entites/bridge-block-cache.entity";
import { getRepository } from "remotes/database";

export async function watch(
  network: string,
  task: (startBlockNumber: number) => Promise<number>
) {
  const repo = getRepository(BridgeBlockCacheEntity);
  const cache =
    (await repo.findOneBy({ network })) ?? new BridgeBlockCacheEntity();

  let startBlockNumber = cache.block || 0;
  let isProcessing = false;
  setInterval(async () => {
    if (isProcessing) {
      return;
    }
    isProcessing = true;
    try {
      startBlockNumber = await task(startBlockNumber);
      cache.network = network;
      cache.block = startBlockNumber;
      await repo.save(cache);
    } catch (e) {
      console.error(e);
    } finally {
      isProcessing = false;
    }
  }, 1000);
}
