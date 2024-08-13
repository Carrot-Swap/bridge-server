import { NETWORKS } from "constants/networks";
import { BridgeBlockCacheEntity } from "entites/bridge-block-cache.entity";
import { getRepository } from "remotes/database";
import { startJob } from "./starJob";
import { getSignerAddress } from "constants/env";

const repo = getRepository(BridgeBlockCacheEntity);
export async function watch(
  network: keyof typeof NETWORKS,
  task: (startBlockNumber: number) => Promise<number>
) {
  const cache =
    (await repo.findOneBy({ id: `${getSignerAddress()}_${network}` })) ??
    new BridgeBlockCacheEntity();

  let startBlockNumber = cache.block || 0;
  await startJob(async () => {
    startBlockNumber = await task(startBlockNumber);
    cache.id = `${getSignerAddress()}_${network}`;
    cache.block = startBlockNumber;
    await repo.save(cache);
  });
}
