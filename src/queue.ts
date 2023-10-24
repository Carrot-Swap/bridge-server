import { CONNECTOR_ABI } from "abis";
import { NETWORKS } from "constants/networks";
import { ethers } from "ethers";
import { BridgeMessage } from "types/BridgeMessage";
import { MessageProcessStatus } from "types/MessageProcessStatus";
import { startTask } from "utils/watch";
import { getSigner } from "./constants";
import { CrossChainMessage } from "./entites";
import { getRepository } from "./remotes";

const messageRepo = getRepository(CrossChainMessage);

const list: BridgeMessage[] = [];

export function append(data: BridgeMessage[]) {
  list.push(...data);
  const res = data.map((item) => CrossChainMessage.from(item));
  messageRepo.insert(res);
}

export async function startDispatcher() {
  startTask(async () => {
    const list = [];
    while (list.length) {
      const item = list.pop();
      console.log("send", item);
      const res = await sendMessage(item);
      list.push(res);
    }
    await update(list);
  });
}

export async function sendMessage(data: BridgeMessage) {
  try {
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

    return {
      ...data,
      status: MessageProcessStatus.DONE,
      destinationTxHash: tx.hash,
    };
  } catch (e) {
    console.error(e);
    return {
      ...data,
      status: MessageProcessStatus.FAIL,
    };
  }
}

async function update(data: BridgeMessage[]) {
  await messageRepo.save(data.map((item) => CrossChainMessage.from(item)));
}
