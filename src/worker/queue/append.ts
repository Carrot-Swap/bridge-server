import { CrossChainMessage } from "entites/message.entity";
import { SignedSignatureEntity } from "entites/signed-signature.entity";
import { getRepository } from "remotes/database";
import { BridgeMessage } from "types/BridgeMessage";
import { signMessages } from "./signMessages";

const messageRepo = getRepository(CrossChainMessage);
const signatureRepo = getRepository(SignedSignatureEntity);

export async function append(data: BridgeMessage[]) {
  const res = data.map((item) => CrossChainMessage.from(item));
  const signed = await signMessages(res);
  await signatureRepo.save(signed);
  messageRepo.save(res);
}
