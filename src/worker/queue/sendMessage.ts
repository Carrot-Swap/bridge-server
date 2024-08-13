import { MULTISIG_TSS_ABI } from "abis";
import { MULTISIG_TSS_ADDRESS } from "constants/addresses";
import { CrossChainMessage } from "entites/message.entity";
import { SignedSignatureEntity } from "entites/signed-signature.entity";
import { Signer, ethers } from "ethers";
import { getRepository } from "remotes/database";
import { MessageProcessStatus } from "types/MessageProcessStatus";

const messageRepo = getRepository(CrossChainMessage);
const signatureRepo = getRepository(SignedSignatureEntity);

const options = {
  47763: { gasPrice: 40000000000 },
};

export async function sendMessage(data: CrossChainMessage, signer: Signer) {
  try {
    const tss = new ethers.Contract(
      MULTISIG_TSS_ADDRESS[data.destinationChainId],
      MULTISIG_TSS_ABI,
      signer
    );
    const signatures = await signatureRepo.find({
      where: { sourceTxHash: data.sourceTxHash },
    });
    const count = await tss.tssSignerCount();
    if (signatures.length < count) {
      return;
    }
    console.log("try send", data);
    const tx = await tss.send(
      data.txSenderAddress,
      data.sourceChainId,
      data.destinationAddress,
      data.message,
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      signatures.map((i) => i.data),
      options[data.destinationChainId]
    );
    await tx.wait();
    data.status = MessageProcessStatus.DONE;
    data.destinationTxHash = tx.hash;
    console.log("sent");
    await messageRepo.save(data);
    return data;
  } catch (e) {
    console.error(e);
    console.log(
      "failed onReceive",
      data.txSenderAddress,
      data.sourceChainId,
      data.destinationAddress,
      data.message
    );
    // Sentry.captureException(e);
    data.status = MessageProcessStatus.FAIL;
    await messageRepo.save(data);
    return data;
  }
}
