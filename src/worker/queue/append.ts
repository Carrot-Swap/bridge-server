import { CrossChainMessage } from "entites/message.entity";
import { getRepository } from "remotes/database";
import { BridgeMessage } from "types/BridgeMessage";

const messageRepo = getRepository(CrossChainMessage);

export function append(data: BridgeMessage[]) {
  const res = data.map((item) => CrossChainMessage.from(item));
  messageRepo.save(res);
}
