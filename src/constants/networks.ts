export enum ChainId {
  NEOX = 47763,
  POLYGON = 137,
  BSC = 56,
  ARBITRUM = 42161,
  ETHEREUM = 1,
  BASE = 8453,
}

interface ChainInfo {
  name: string;
  observeUrls: string[];
  signUrls: string[];
}

export const NETWORKS: Record<ChainId, ChainInfo> = {
  47763: {
    name: "Neo X",
    observeUrls: [
      `https://mainnet-1.rpc.banelabs.org`,
      "https://mainnet-2.rpc.banelabs.org",
    ],
    signUrls: [
      `https://mainnet-3.rpc.banelabs.org`,
      "https://mainnet-2.rpc.banelabs.org",
      `https://mainnet-1.rpc.banelabs.org`,
    ],
  },
  1: {
    name: "Ethereum",
    observeUrls: [
      "https://ethereum.rpc.thirdweb.com/",
      "https://eth-mainnet.blastapi.io/b2ba308a-2b28-49dd-9994-6e8dc92b5a6d",
      "https://eth.llamarpc.com",
      "https://uk.rpc.blxrbdn.com",
      "https://eth.rpc.blxrbdn.com",
      "https://eth-mainnet.public.blastapi.io",
      "https://cloudflare-eth.com",
      "https://eth.merkle.io",
    ],
    signUrls: [
      "https://ethereum.rpc.thirdweb.com/",
      "https://eth-mainnet.blastapi.io/b2ba308a-2b28-49dd-9994-6e8dc92b5a6d",
      "https://eth.llamarpc.com",
      "https://uk.rpc.blxrbdn.com",
      "https://eth.rpc.blxrbdn.com",
      "https://eth-mainnet.public.blastapi.io",
      "https://cloudflare-eth.com",
      "https://eth.merkle.io",
    ],
  },
  137: {
    observeUrls: [
      // "https://polygon.drpc.org",
      // "https://polygon.llamarpc.com",
      "https://polygon-pokt.nodies.app",
    ],
    name: "Polygon",
    signUrls: ["https://polygon.drpc.org"],
  },
  56: {
    name: "Binance Smart Chain",
    observeUrls: [
      "https://binance.llamarpc.com",
      "https://bsc-pokt.nodies.app",
      "https://bsc.rpc.blxrbdn.com",
    ],
    signUrls: [
      "https://bsc.publicnode.com",
      "https://binance.llamarpc.com",
      "https://bsc-pokt.nodies.app",
      "https://bsc.rpc.blxrbdn.com",
    ],
  },
  [ChainId.ARBITRUM]: {
    observeUrls: [
      `https://arb1.arbitrum.io/rpc`,
      "https://arbitrum.llamarpc.com",
      "https://arbitrum.drpc.org",
      "https://rpc.ankr.com/arbitrum",
    ],
    signUrls: [
      `https://arb1.arbitrum.io/rpc`,
      "https://arbitrum.llamarpc.com",
      "https://arbitrum.drpc.org",
      "https://rpc.ankr.com/arbitrum",
    ],
    name: "Arbitrum One",
  },
  [ChainId.BASE]: {
    observeUrls: [
      `https://mainnet.base.org`,
      "https://base.llamarpc.com",
      "https://developer-access-mainnet.base.org",
      "https://base.blockpi.network/v1/rpc/public",
      "https://1rpc.io/base",
    ],
    signUrls: [
      `https://mainnet.base.org`,
      "https://base.llamarpc.com",
      "https://developer-access-mainnet.base.org",
      "https://base.blockpi.network/v1/rpc/public",
      "https://1rpc.io/base",
    ],
    name: "BASE",
  },
};
