export interface BridgeMessageSent {
  txOriginAddress: string;
  txSenderAddress: string;
  destinationChainId: string;
  destinationAddress: string;
  destinationGasLimit: string;
  message: string;
  bridgeParams: string;
}
