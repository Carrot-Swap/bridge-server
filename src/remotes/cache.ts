import { subDays } from "date-fns";
import { FaucetCacheEntity } from "entites/bridge-block-cache.entity";
import { first } from "lodash";
import { getRepository } from "./database";
import { Request } from "Request";

async function getPrevCach(list: { id: string; address: string }[]) {
  const repo = getRepository(FaucetCacheEntity);
  const prev = await repo
    .createQueryBuilder("faucet_cache")
    .select()
    .where("faucet_cache.discord_id in (:...ids)", {
      ids: list.map((i) => i.id),
    })
    .orWhere("faucet_cache.address in (:...address)", {
      address: list.map((i) => i.address),
    })
    .getMany();
  return prev;
}

export async function checkAlreadyReceived(id: string, address: string) {
  const prev = await getPrevCach([{ id, address }]);
  if (!prev.length) {
    return 0;
  }
  const timeDiff =
    first(prev).last.getTime() - subDays(new Date(), 1).getTime();
  return timeDiff <= 0 ? 0 : timeDiff;
}

export async function saveCache(requests: Request[]) {
  const list = requests.map((item) => ({
    id: item.message.author.id,
    address: item.address,
  }));
  const prevItems = await getPrevCach(list);
  const repo = getRepository(FaucetCacheEntity);
  const items = list.map((item) => {
    const row =
      prevItems.find(
        (i) =>
          i.discordUser === item.id || i.address === item.address.toLowerCase()
      ) ?? new FaucetCacheEntity();
    row.discordUser = item.id;
    row.service = "carrot";
    row.address = item.address.toLowerCase();
    row.last = new Date();
    return row;
  });
  await repo.save(items);
}
