import { CONNECTOR_ABI } from "abis";
import { CONNECTOR_ADDRESS } from "constants/addresses";
import { ethers } from "ethers";
import { BridgeMessage } from "types/BridgeMessage";
import { ResilientRpcProvider } from "utils/ResilientRpcProvider";
import { watch } from "utils/watch";
import { append } from "worker/queue/append";
import { NETWORKS } from "./constants/networks";

const SENT_EVENT =
  "0x5b597f6fee9cb6d502de7253fc9d6cd9ca476deb484015b3026c58efbb350b1b";

export async function watchEvm(network: keyof typeof NETWORKS) {
  const { url } = NETWORKS[network];
  await watch(network, async (startBlockNumber) => {
    const provider = new ResilientRpcProvider(url, network);
    const contract = new ethers.Contract(
      CONNECTOR_ADDRESS[network],
      CONNECTOR_ABI
    );
    const currentBlock = await provider.getBlockNumber();
    const logs = await provider.getLogs({
      fromBlock: startBlockNumber,
      toBlock: currentBlock,
      address: [CONNECTOR_ADDRESS[network]],
      topics: [SENT_EVENT],
    });
    const res: BridgeMessage[] = logs.map((log) => {
      const [
        sourceTxOriginAddress,
        bridgeTxSenderAddress,
        destinationChainId,
        destinationAddress,
        destinationGasLimit,
        message,
        bridgeParams,
      ] = contract.interface.decodeEventLog(
        "BridgeMessageSent",
        log.data,
        log.topics
      );

      return {
        txHash: log.transactionHash,
        sourceChainId: network,
        txOriginAddress: sourceTxOriginAddress,
        txSenderAddress: bridgeTxSenderAddress,
        destinationChainId: destinationChainId,
        destinationAddress: destinationAddress,
        destinationGasLimit: destinationGasLimit,
        message: message,
        bridgeParams: bridgeParams,
      };
    });
    append(res);
    return currentBlock;
  });
}
