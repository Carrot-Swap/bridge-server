import { CONNECTOR_ADDRESS } from "constants/connector-address";
import { NETWORKS } from "constants/networks";
import { ethers } from "ethers";
import { BridgeMessageSent } from "types/BridgeMessageSent";
import { startTask } from "utils/watch";
import { getSigner } from "./constants";
const abi = require("./abis/CarrotBridgeConnector.json");

const list: BridgeMessageSent[] = [];

const CHAIN_NAME_BY_ID = {
  2970385: "neo_evm_testnet",
  7001: "zeta",
};

export function append(data: BridgeMessageSent[]) {
  list.push(...data);
}

export async function startDispatcher() {
  startTask(async () => {
    for (const item of list) {
      const chainName = CHAIN_NAME_BY_ID[item.destinationChainId];
      const [url, name, chainId] = NETWORKS[chainName];
      const signer = getSigner(url, name, chainId);
      const address = CONNECTOR_ADDRESS[chainName];
      const connector = new ethers.Contract(address, abi, signer);
      console.log(
        "send message",
        item.txSenderAddress,
        item.sourceChainId,
        item.destinationAddress,
        item.message,
        item.bridgeParams
      );
      const tx = await connector.onReceive(
        item.txSenderAddress,
        item.sourceChainId,
        item.destinationAddress,
        item.message,
        item.bridgeParams
      );
      await tx.wait();
    }
  });
}
