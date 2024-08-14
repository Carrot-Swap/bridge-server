import { RECEIVE_VERIFY_SIGNATURE_ABI } from "abis";
import { RECEVIE_VERIFY_SIGNATURE_ADDRESS } from "constants/addresses";
import { getSigner } from "constants/env";
import { NETWORKS } from "constants/networks";
import { CrossChainMessage } from "entites/message.entity";
import { SignedSignatureEntity } from "entites/signed-signature.entity";
import { ethers, getBytes } from "ethers";

export async function signMessages(messages: CrossChainMessage[]) {
  if (!messages.length) {
    return [];
  }
  console.log("sign messages", messages.length);

  const res = await Promise.all(
    messages.map(async (i) => {
      const { url } = NETWORKS[i.destinationChainId];
      const signer = getSigner(url, Number(i.destinationChainId));
      const contract = new ethers.Contract(
        RECEVIE_VERIFY_SIGNATURE_ADDRESS[i.destinationChainId],
        RECEIVE_VERIFY_SIGNATURE_ABI,
        signer
      );
      const messageHash = await contract.getMessageHash.staticCall(
        i.sourceTxHash,
        i.txSenderAddress,
        i.sourceChainId,
        i.destinationAddress,
        i.message,
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
      const signature = await signer.signMessage(getBytes(messageHash));
      const row = new SignedSignatureEntity();
      row.signer = signer.address;
      row.sourceTxHash = i.sourceTxHash;
      row.data = signature;
      return row;
    })
  );
  return res;
}
