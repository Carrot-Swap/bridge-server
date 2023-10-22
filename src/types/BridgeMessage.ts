export interface BridgeMessage {
  sourceChainId: number;
  txOriginAddress: string;
  txSenderAddress: string;
  destinationChainId: string;
  destinationAddress: string;
  destinationGasLimit: string;
  message: string;
  bridgeParams: string;
}
