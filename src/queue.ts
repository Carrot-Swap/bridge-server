import { CONNECTOR_ABI } from "abis";
import { NETWORKS } from "constants/networks";
import { ethers } from "ethers";
import { BridgeMessage } from "types/BridgeMessage";
import { startTask } from "utils/watch";
import { getSigner } from "./constants";

const list: BridgeMessage[] = [];

// const CHAIN_NAME_BY_ID = {
//   2970385: "neo_evm_testnet",
//   7001: "zeta",
// };

export function append(data: BridgeMessage[]) {
  list.push(...data);
}

export async function startDispatcher() {
  startTask(async () => {
    while (list.length) {
      const item = list.pop();
      // const chainName = CHAIN_NAME_BY_ID[item.destinationChainId];
      // const [url, name, chainId] = NETWORKS[chainName];
      // const signer = getSigner(url, name, chainId);
      // const address = CONNECTOR_ADDRESS[chainName];
      // const connector = new ethers.Contract(address, CARROT_BRIDGE_ABI, signer);
      console.log("send", item);
      await sendMessage(item);
    }
  });
}

// const data: BridgeMessage = {
//   sourceChainId: 80001,
//   txOriginAddress: "0x76f317860f19df6766ff496f4d2e4502079b94f7",
//   txSenderAddress: "0x2987B8C58B205134b9b5444079d6C4e3C7d5835E",
//   destinationChainId: "2970385",
//   destinationAddress: "0xf056e7cfd3a451695fbb2e2d095bd649244fe759",
//   destinationGasLimit: "0",
//   message: "00000000000000000000000000000000000000000000000000000000000138810000000000000000000000005452b3c46e756e8bcf482ee6490ddcb9f5ef83df0000000000000000000000000000000000000000000000000de0b6b3a7640000",
//   bridgeParams: "",
// };

// {
//   sourceChainId: 80001,
//   txOriginAddress: '0xef1F5D4C835Ac094F8D96C26c2A964C99b4050e0',
//   txSenderAddress: '0x7e753a9f5585e67149d452F94309f490c3853A89',
//   destinationChainId: 2970385n,
//   destinationAddress: '0xF056e7cfD3A451695FbB2E2D095bd649244Fe759',
//   destinationGasLimit: 0n,
//   message: '0x00000000000000000000000000000000000000000000000000000000000138810000000000000000000000005452b3c46e756e8bcf482ee6490ddcb9f5ef83df000000000000000000000000000000000000000000000000000000174876e800',
//   bridgeParams: '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000'
// }

export async function sendMessage(data: BridgeMessage) {
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
  console.log(tx.hash);
}
