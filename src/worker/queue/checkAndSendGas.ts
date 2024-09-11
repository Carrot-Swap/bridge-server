import { getSigner } from "constants/env";
import { ChainId, NETWORKS } from "constants/networks";
import { formatEther, parseEther } from "ethers";
import { processedChargeGas } from "remotes/carrot/charge-gas";
import { fetchCEXPrices } from "remotes/fetchCEXPrices";
import { formatDecimals } from "utils/formatDecimals";
import { ResilientRpcProvider } from "utils/ResilientRpcProvider";

export interface ChargeGas {
  txHash: string;
  chainId: number;
}

export async function checkAndSendGas(list: ChargeGas[]) {
  const { signUrls } = NETWORKS[ChainId.NEOX];
  const signer = getSigner(signUrls, ChainId.NEOX);
  const prices = await fetchCEXPrices();

  for (const item of list) {
    if (!NETWORKS[item.chainId]) {
      return;
    }
    const { observeUrls: url } = NETWORKS[item.chainId];
    const provider = new ResilientRpcProvider(url, item.chainId, true);
    const receipt = await provider.getTransactionReceipt(item.txHash);
    if (
      receipt.status !== 1 ||
      receipt.to.toLowerCase() !== "0x31285fa517f7503f5b0fee341019f1d701353d0f"
    ) {
      return;
    }
    const tx = await provider.getTransaction(item.txHash);
    const eth = Number(formatEther(tx.value));
    if (eth == 0) {
      return;
    }
    const price = prices[SYMBOL_BY_CHAIN_ID[item.chainId]];
    const gasPrice = prices["GAS"];
    if (!price || !gasPrice) {
      return;
    }
    const payAmountInUSD = eth * price;
    if (!payAmountInUSD) {
      return;
    }
    const gasAmount = formatDecimals(payAmountInUSD / (gasPrice * 1.05), 9);
    console.log(`sending ${gasAmount} $GAS`);
    const feeData = await signer.provider.getFeeData();
    const processedTx = await signer.sendTransaction({
      to: tx.from,
      from: signer.address,
      value: parseEther(String(gasAmount)),
      gasPrice: feeData.gasPrice,
    });
    const signature = await signer.signMessage(
      `${item.txHash}${processedTx.hash}`
    );
    await processedChargeGas(
      item.txHash,
      processedTx.hash,
      signature,
      payAmountInUSD,
      gasAmount * gasPrice,
      gasAmount
    );
    await processedTx.wait();

    console.log(`send ${gasAmount} $GAS`);
  }
}

const SYMBOL_BY_CHAIN_ID = {
  1: "ETH",
  56: "BNB",
  137: "MATIC",
  [ChainId.ARBITRUM]: "ETH",
  [ChainId.BASE]: "ETH",
};
