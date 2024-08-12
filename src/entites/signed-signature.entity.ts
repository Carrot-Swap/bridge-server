import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("signed_signature")
export class SignedSignatureEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  signer: string;

  @Column({ name: "source_tx_hash" })
  sourceTxHash: string;

  @Column({ name: "data" })
  data: string;
}
