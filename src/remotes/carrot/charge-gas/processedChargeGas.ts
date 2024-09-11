import { carrotRequester } from "../requester";

export async function processedChargeGas(
  txHash: string,
  processedTxHash: string,
  signature: string,
  amountInUSD: number,
  gasAmountInUSD: number,
  gasAmount: number
) {
  await carrotRequester.post("/charge-gas/processed", {
    txHash,
    processedTxHash,
    signature,
    amountInUSD,
    gasAmountInUSD,
    gasAmount,
  });
}
