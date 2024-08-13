import { NETWORKS } from "constants/networks";
import { BridgeBlockCacheEntity } from "entites/bridge-block-cache.entity";
import { getRepository } from "remotes/database";
import { startJob } from "./starJob";

const repo = getRepository(BridgeBlockCacheEntity);
export async function watch(
  network: keyof typeof NETWORKS,
  task: (startBlockNumber: number) => Promise<number>
) {
  const cache =
    (await repo.findOneBy({ chainId: network })) ??
    new BridgeBlockCacheEntity();

  let startBlockNumber = cache.block || 0;
  await startJob(async () => {
    startBlockNumber = await task(startBlockNumber);
    cache.chainId = network;
    cache.block = startBlockNumber;
    await repo.save(cache);
  });
}
