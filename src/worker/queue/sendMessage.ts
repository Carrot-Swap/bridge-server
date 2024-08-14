import { MULTISIG_TSS_ABI } from "abis";
import { MULTISIG_TSS_ADDRESS } from "constants/addresses";
import { CrossChainMessage } from "entites/message.entity";
import { SignedSignatureEntity } from "entites/signed-signature.entity";
import { Signer, ethers } from "ethers";
import { uniqBy } from "lodash";
import { getRepository } from "remotes/database";
import { MessageProcessStatus } from "types/MessageProcessStatus";

const messageRepo = getRepository(CrossChainMessage);
const signatureRepo = getRepository(SignedSignatureEntity);

const options = {
  47763: { gasPrice: 40000000000 },
};

export async function sendMessage(data: CrossChainMessage, signer: Signer) {
  const tss = new ethers.Contract(
    MULTISIG_TSS_ADDRESS[data.destinationChainId],
    MULTISIG_TSS_ABI,
    signer
  );
  const signatures = await signatureRepo
    .find({
      where: { sourceTxHash: data.sourceTxHash },
    })
    .then((res) => uniqBy(res, (i) => i.signer));
  const count = await tss.tssSignerCount();
  if (signatures.length < count) {
    return;
  }
  console.log("try send", data.sourceTxHash);
  const args = [
    data.sourceTxHash,
    data.txSenderAddress,
    data.sourceChainId,
    data.destinationAddress,
    data.message,
    "0x0000000000000000000000000000000000000000000000000000000000000000",
    signatures.map((i) => i.data),
    options[data.destinationChainId] || {},
  ];
  await tss.onReceive.staticCall(...args);
  const estimatedGas = await tss.onReceive.estimateGas(...args);
  const feeData = await signer.provider.getFeeData();
  const estimatedTxFee = estimatedGas * feeData.gasPrice;
  const balance = await signer.provider.getBalance(await signer.getAddress());
  if (estimatedTxFee > balance) {
    console.log("Insuffient gas in tss wallet");
    return;
  }

  try {
    const tx = await tss.onReceive(...args);
    data.destinationTxHash = tx.hash;
    await tx.wait();
    data.status = MessageProcessStatus.DONE;
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
