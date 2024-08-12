import { VERIFY_SIGNATURE_ABI } from "abis";
import { VERIFY_SIGNATURE_ADDRESS } from "constants/addresses";
import { getSigner, getSignerAddress } from "constants/env";
import { NETWORKS } from "constants/networks";
import { CrossChainMessage } from "entites/message.entity";
import { SignedSignatureEntity } from "entites/signed-signature.entity";
import { ethers, getBytes } from "ethers";
import { getRepository } from "typeorm";
import { MessageProcessStatus } from "types/MessageProcessStatus";

const messageRepo = getRepository(CrossChainMessage);
const signatureRepo = getRepository(SignedSignatureEntity);

export async function signMessages() {
  const pendings: string[] = await messageRepo
    .query(
      `select source_tx_hash from cross_chain_message where status = ${MessageProcessStatus.PENDING}`
    )
    .then((res) => res.map((i) => i.source_tx_hash));

  const excludes = await signatureRepo
    .createQueryBuilder("signed_signature")
    .select()
    .where("signed_signature.source_tx_hash IN (:...targets)", {
      targets: pendings,
    })
    .andWhere("LOWER(signed_signature.signer) = LOWER(:signer)", {
      signer: getSignerAddress(),
    })
    .getMany();

  const targets = pendings.filter(
    (i) =>
      !excludes.find((j) => j.sourceTxHash.toLowerCase() === i.toLowerCase())
  );

  const messages = await messageRepo
    .createQueryBuilder("cross_chain_message")
    .select()
    .where("cross_chain_message.source_tx_hash NOT IN (:...targets)", {
      targets,
    })
    .getMany();

  const res = await Promise.all(
    messages.map(async (i) => {
      const { url } = NETWORKS[i.sourceChainId];
      const signer = getSigner(url, i.sourceChainId);
      const contract = new ethers.Contract(
        VERIFY_SIGNATURE_ADDRESS[i.sourceChainId],
        VERIFY_SIGNATURE_ABI
      );
      const messageHash = await contract.getMessageHash(
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
  await signatureRepo.save(res);
}
