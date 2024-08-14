import { ethers } from "ethers";
import { ResilientRpcProvider } from "utils/ResilientRpcProvider";

export const PRIVATE_KEY = () => process.env.PRIVATE_KEY;
export const BOT_TYPE = () => process.argv[2];
export const DISCORD_TOKEN = () => process.env.DISCORD_TOKEN;
export const MISSION_KEY = () => process.env.MISSION_KEY;

const instances: Record<number, ethers.Wallet> = {};

export function getSignerAddress() {
  const wallet = new ethers.Wallet(process.env.EVM_PRIVATE_KEY);
  return wallet.address;
}

export function getSigner(url: string[], chainId: number) {
  if (instances[chainId]) {
    return instances[chainId];
  }
  const provider = new ResilientRpcProvider(url, chainId, true);
  const signer = new ethers.Wallet(process.env.EVM_PRIVATE_KEY, provider);
  instances[chainId] = signer;
  return signer;
}

export const DATABASE_CONFIG = () =>
  ({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT) || 5432,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  } as const);
