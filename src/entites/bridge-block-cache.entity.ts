import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("bridge_block_cache")
export class BridgeBlockCacheEntity {
  @PrimaryColumn({ name: "chain_id" })
  chainId: number;

  @Column({})
  block: number;
}
