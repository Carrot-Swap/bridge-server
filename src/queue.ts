import { CONNECTOR_ABI } from "abis";
import { NETWORKS } from "constants/networks";
import { ethers } from "ethers";
import { resolveMission } from "remotes/carrot";
import { BridgeMessage } from "types/BridgeMessage";
import { MessageProcessStatus } from "types/MessageProcessStatus";
import { startTask } from "utils/watch";
import { getSigner } from "./constants";
import { CrossChainMessage } from "./entites";
import { getRepository } from "./remotes";
const _ = require("lodash");

const messageRepo = getRepository(CrossChainMessage);

export function append(data: BridgeMessage[]) {
  const res = data.map((item) => CrossChainMessage.from(item));
  messageRepo.save(res);
}

export async function startDispatcher() {
  startTask(async () => {
    const targets = await messageRepo.find({
      where: { status: MessageProcessStatus.PENDING },
    });
    for (const chunk of _.chunk(targets, 5)) {
      await update(chunk.map(sendMessage));
    }
  });
}

export async function sendMessage(data: CrossChainMessage) {
  try {
    console.log("send", data);
    const [url, name, chainId] = NETWORKS.neo_evm_testnet;
    const signer = getSigner(url, name, chainId);
    const connector = new ethers.Contract(
      "0xfef2e1ebcde3563F377f5B8f3B96eA85Dcd45540",
      CONNECTOR_ABI,
      signer
    );
    const tx = await connector.onReceive(
      data.txSenderAddress,
      data.sourceChainId,
      data.destinationAddress,
      data.message,
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    );
    await tx.wait();

    data.status = MessageProcessStatus.DONE;
    data.destinationAddress = tx.hash;
    return data;
  } catch (e) {
    console.log(e);
    data.status = MessageProcessStatus.FAIL;
    return data;
  }
}

async function update(data: CrossChainMessage[]) {
  await messageRepo.save(data);
  const list = data
    .filter((i) => i.status === MessageProcessStatus.DONE)
    .map((i) => i.sourceTxHash);
  resolveMission(list).catch(console.error);
}

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
