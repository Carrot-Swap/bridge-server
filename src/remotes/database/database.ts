import { DataSource, EntityTarget, ObjectLiteral, Repository } from "typeorm";
import { DATABASE_CONFIG } from "../../constants";
import { BridgeBlockCacheEntity, CrossChainMessage } from "../../entites";

export const database = new DataSource({
  type: "postgres",
  ...DATABASE_CONFIG(),
  synchronize: true,
  entities: [BridgeBlockCacheEntity, CrossChainMessage],
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

export function getRepository<Entity extends ObjectLiteral>(
  target: EntityTarget<Entity>
): Repository<Entity> {
  return database.getRepository(target);
}
