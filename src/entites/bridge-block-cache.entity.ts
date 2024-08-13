import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("bridge_block_cache")
export class BridgeBlockCacheEntity {
  @PrimaryColumn({ name: "id" })
  id: string;

  @Column({})
  block: number;
}
