import { ChargeGas } from "worker/queue/checkAndSendGas";
import { carrotRequester } from "../requester";

export async function lookupChargeGasRequests() {
  const res = await carrotRequester.get<ChargeGas[]>("/charge-gas");
  return res.data;
}
