import { CONNECTOR_ABI } from "abis";
import { NETWORKS } from "constants/networks";
import { Signer, ethers } from "ethers";
import { BridgeMessage } from "types/BridgeMessage";
import { MessageProcessStatus } from "types/MessageProcessStatus";
import { startTask } from "utils/watch";
import { getSigner } from "./constants";
import { CrossChainMessage } from "./entites";
import { getRepository } from "./remotes";
import { sleep } from "./utils";
const _ = require("lodash");

const messageRepo = getRepository(CrossChainMessage);

export function append(data: BridgeMessage[]) {
  const res = data.map((item) => CrossChainMessage.from(item));
  messageRepo.save(res);
}

export async function startDispatcher() {
  const [url, name, chainId] = NETWORKS.eth_sepolia;
  const signer = getSigner(url, name, chainId);
  const start = async (targets: CrossChainMessage[]) => {
    for (const chunk of _.chunk(targets, 10)) {
      let nonce = await signer.getNonce();

      const list: Promise<CrossChainMessage>[] = [];
      for (const item of chunk) {
        const wait = sendMessage(item, signer, nonce++).then(update);
        list.push(wait);
        await sleep(100);
      }
      const res = await Promise.all(list);
      if (res.every((i) => i.status === MessageProcessStatus.FAIL)) {
        await sleep(60000);
        continue;
      }
      // resolveMossions(res);
    }
  };
  startTask(async () => {
    const targets = await messageRepo.find({
      where: { status: MessageProcessStatus.PENDING },
    });
    await start(targets);

    const retryList = await messageRepo.find({
      where: { status: MessageProcessStatus.FAIL },
    });
    await start(retryList);
  });
}
export async function sendMessage(
  data: CrossChainMessage,
  signer: Signer,
  nonce: number
) {
  // console.log("send", data);
  try {
    const connector = new ethers.Contract(
      "0x0149392a9EEE985F2B82B8a64213BB10159863F8",
      CONNECTOR_ABI,
      signer
    );
    const tx = await connector.onReceive(
      data.txSenderAddress,
      data.sourceChainId,
      data.destinationAddress,
      data.message,
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      {
        nonce,
      }
    );
    await tx.wait();
    data.status = MessageProcessStatus.DONE;
    data.destinationTxHash = tx.hash;
    return data;
  } catch (e) {
    console.log(
      "onReceive",
      data.txSenderAddress,
      data.sourceChainId,
      data.destinationAddress,
      data.message
    );
    // Sentry.captureException(e);
    data.status = MessageProcessStatus.FAIL;
    return data;
  }
}

async function update(data: CrossChainMessage) {
  return await messageRepo.save(data);
}

// async function resolveMossions(data: CrossChainMessage[]) {
//   const list = data.filter((i) => i.status === MessageProcessStatus.DONE);
//   if (!list.length) {
//     return;
//   }
//   console.log(
//     "resolve missions",
//     list.map((i) => i.sourceTxHash)
//   );
//   resolveMission(list.map((i) => i.sourceTxHash)).catch(
//     Sentry.captureException
//   );
// }

// {
//   sourceTxHash: '0x5839d7c24a887434ea7e3c3cd07da10745ee8fa5f6d69cbab4294166c09759d2',
//   destinationTxHash: null,
//   sourceChainId: 80001,
//   txOriginAddress: '0xef1F5D4C835Ac094F8D96C26c2A964C99b4050e0',
//   txSenderAddress: '0x7e753a9f5585e67149d452F94309f490c3853A89',
//   destinationChainId: '2970385',
//   destinationAddress: '0xF056e7cfD3A451695FbB2E2D095bd649244Fe759',
//   destinationGasLimit: '0',
//   message: '0x0000000000000000000000000000000000000000000000000000000000013881000000000000000000000000ef1f5d4c835ac094f8d96c26c2a964c99b4050e000000000000000000000000000000000000000000000000000005af3107a4000',
//   bridgeParams: '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000',
//   status: 2
// }
