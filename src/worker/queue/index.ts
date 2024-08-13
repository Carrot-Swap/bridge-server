import { NETWORKS } from "constants/networks";
import { MessageProcessStatus } from "types/MessageProcessStatus";
import { startJob } from "utils/starJob";
import { getSigner } from "../../constants";
import { CrossChainMessage } from "../../entites";
import { getRepository } from "../../remotes";
import { sendMessage } from "./sendMessage";

const messageRepo = getRepository(CrossChainMessage);

export async function startDispatcher(sendMessage?: boolean) {
  startJob(async () => {
    if (!sendMessage) {
      return;
    }
    const targets = await messageRepo.find({
      where: { status: MessageProcessStatus.PENDING },
    });
    await start(targets);

    // const retryList = await messageRepo.find({
    //   where: { status: MessageProcessStatus.FAIL },
    // });
    // await start(retryList);
  });
}

const start = async (targets: CrossChainMessage[]) => {
  for (const item of targets) {
    const { url } = NETWORKS[item.destinationChainId];
    const signer = getSigner(url, Number(item.destinationChainId));
    await sendMessage(item, signer);
  }
};
