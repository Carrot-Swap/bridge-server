import { getSignerAddress } from "constants/env";
import { CrossChainMessage } from "entites/message.entity";
import { SignedSignatureEntity } from "entites/signed-signature.entity";
import { getRepository } from "remotes/database";
import { BridgeMessage } from "types/BridgeMessage";
import { signMessages } from "./signMessages";
import { sendSlackNotify } from "remotes/slack";

const messageRepo = getRepository(CrossChainMessage);
const signatureRepo = getRepository(SignedSignatureEntity);

export async function append(data: BridgeMessage[], save?: boolean) {
  if (!data.length) {
    return;
  }
  console.log("append message", data);
  const res = data.map((item) => CrossChainMessage.from(item));
  await Promise.all([signMessagesIfNeed(res), saveMessagesIfNeed(res, save)]);
}

async function signMessagesIfNeed(res: CrossChainMessage[]) {
  if (!res.length) {
    return;
  }
  const alreadySigned = await signatureRepo
    .createQueryBuilder("signed_signature")
    .select()
    .where("signed_signature.source_tx_hash in (:...txs)", {
      txs: res.map((i) => i.sourceTxHash),
    })
    .andWhere("signed_signature.signer = (:signer)", {
      signer: getSignerAddress(),
    })
    .getMany()
    .then((i) => i.map((i) => i.sourceTxHash));

  const signTargets = res.filter(
    (t) => !alreadySigned.includes(t.sourceTxHash)
  );
  console.log("signTargets : ", signTargets.length);
  if (!signTargets.length) {
    return;
  }
  const result = await signMessages(signTargets);
  await signatureRepo.save(result);

  sendSlackNotify(
    `[${getSignerAddress()}] Sign Message ${result
      .map((i) => i.sourceTxHash)
      .join()}`
  );
}

async function saveMessagesIfNeed(res: CrossChainMessage[], save?: boolean) {
  if (!res.length || !save) {
    return;
  }
  const alreadySaved = await messageRepo
    .createQueryBuilder("cross_chain_message")
    .select()
    .where("cross_chain_message.source_tx_hash in (:...txs)", {
      txs: res.map((i) => i.sourceTxHash),
    })
    .getMany()
    .then((i) => i.map((i) => i.sourceTxHash));

  const saveTargets = res.filter((t) => !alreadySaved.includes(t.sourceTxHash));
  if (saveTargets.length) {
    messageRepo.save(saveTargets);
  }
}
