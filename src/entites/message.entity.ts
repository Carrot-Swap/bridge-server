import { Column, Entity, PrimaryColumn } from "typeorm";
import { BridgeMessage } from "types/BridgeMessage";
import { MessageProcessStatus } from "types/MessageProcessStatus";

@Entity("cross_chain_message")
export class CrossChainMessage {
  static from(item: BridgeMessage) {
    const row = new CrossChainMessage();
    row.sourceTxHash = item.txHash;
    row.sourceChainId = item.sourceChainId;
    row.txOriginAddress = item.txOriginAddress;
    row.txSenderAddress = item.txSenderAddress;
    row.destinationChainId = item.destinationChainId;
    row.destinationAddress = item.destinationAddress;
    row.destinationGasLimit = item.destinationGasLimit;
    row.message = item.message;
    row.bridgeParams = item.bridgeParams;
    row.status = item.status ?? MessageProcessStatus.PENDING;
    row.destinationTxHash = item.destinationTxHash;
    row.time = new Date();
    return row;
  }

  @PrimaryColumn({ name: "source_tx_hash" })
  sourceTxHash: string;

  @Column({ name: "destination_tx_hash", nullable: true })
  destinationTxHash: string;

  @Column({ name: "source_chain_id" })
  sourceChainId: number;

  @Column({ name: "tx_origin_address" })
  txOriginAddress: string;

  @Column({ name: "tx_sender_address" })
  txSenderAddress: string;

  @Column({ name: "destiantion_chain_id" })
  destinationChainId: string;

  @Column({ name: "destiantion_address" })
  destinationAddress: string;

  @Column({ name: "destiantion_gas_limit" })
  destinationGasLimit: string;

  @Column({ name: "message" })
  message: string;

  @Column({ name: "bridge_params" })
  bridgeParams: string;

  @Column({})
  status: MessageProcessStatus;

  @Column({ nullable: true })
  time: Date;
}
