import { MessageProcessStatus } from "./MessageProcessStatus";

export interface BridgeMessage {
  txHash: string;
  sourceChainId: number;
  txOriginAddress: string;
  txSenderAddress: string;
  destinationChainId: string;
  destinationAddress: string;
  destinationGasLimit: string;
  message: string;
  bridgeParams: string;
  status?: MessageProcessStatus;
  destinationTxHash?: string;
}
