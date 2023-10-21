import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("bridge_block_cache")
export class BridgeBlockCacheEntity {
  @PrimaryColumn()
  network: string;

  @Column({})
  block: number;
}
