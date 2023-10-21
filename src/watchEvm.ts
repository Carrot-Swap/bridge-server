import { CONNECTOR_ADDRESS } from "constants/connector-address";
import { ethers } from "ethers";
import { watch } from "utls/watch";
import { NETWORKS } from "./constants/networks";

export async function watchEvm(network: keyof typeof NETWORKS) {
  const [url, name, chainId] = NETWORKS[network];
  await watch(network, async (startBlockNumber) => {
    const provider = new ethers.JsonRpcProvider(url, { name, chainId });
    const currentBlock = await provider.getBlockNumber();
    const logs = await provider.getLogs({
      fromBlock: startBlockNumber,
      toBlock: currentBlock,
      address: [CONNECTOR_ADDRESS[network]],
    });
    console.log(logs);

    return startBlockNumber;
  });
}
