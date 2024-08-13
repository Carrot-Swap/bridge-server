import { VERIFY_SIGNATURE_ABI } from "abis";
import { VERIFY_SIGNATURE_ADDRESS } from "constants/addresses";
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
      const { url } = NETWORKS[i.sourceChainId];
      const signer = getSigner(url, i.sourceChainId);
      const contract = new ethers.Contract(
        VERIFY_SIGNATURE_ADDRESS[i.sourceChainId],
        VERIFY_SIGNATURE_ABI,
        signer
      );
      const messageHash = await contract.getMessageHash.staticCall(
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
