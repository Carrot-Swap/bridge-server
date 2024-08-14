import { ChainId, NETWORKS } from "constants/networks";
import { MessageProcessStatus } from "types/MessageProcessStatus";
import { startJob } from "utils/starJob";
import { getSigner } from "../../constants";
import { CrossChainMessage } from "../../entites";
import { getRepository } from "../../remotes";
import { sendMessage } from "./sendMessage";

const messageRepo = getRepository(CrossChainMessage);

export async function startDispatcher(
  chainIds: (keyof typeof NETWORKS)[],
  sendMessage?: boolean
) {
  if (!sendMessage) {
    return;
  }
  await Promise.all(chainIds.map((id) => startJob(() => start(id))));
}

const start = async (chainId: keyof typeof NETWORKS) => {
  const targets = await messageRepo.find({
    where: {
      status: MessageProcessStatus.PENDING,
      destinationChainId: String(chainId),
    },
  });
  if (!targets.length) {
    return;
  }
  for (const item of targets) {
    const { signUrls } = NETWORKS[Number(item.destinationChainId) as ChainId];
    const signer = getSigner(signUrls, Number(item.destinationChainId));
    await sendMessage(item, signer);
  }
};
