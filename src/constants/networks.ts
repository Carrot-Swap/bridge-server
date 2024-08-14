export enum ChainId {
  NEOX = 47763,
  POLYGON = 137,
  BSC = 56,
  ARBITRUM = 42161,
  ETHEREUM = 1,
}

interface ChainInfo {
  name: string;
  observeUrls: string[];
  signUrls: string[];
}

export const NETWORKS: Record<ChainId, ChainInfo> = {
  47763: {
    name: "Neo X",
    observeUrls: [`https://mainnet-1.rpc.banelabs.org`],
    signUrls: [`https://mainnet-1.rpc.banelabs.org`],
  },
  1: {
    name: "Ethereum",
    observeUrls: [
      "https://eth.llamarpc.com",
      "https://virginia.rpc.blxrbdn.com",
      "https://ethereum-mainnet.gateway.tatum.io",
      "https://uk.rpc.blxrbdn.com",
    ],
    signUrls: [
      "https://eth.llamarpc.com",
      "https://virginia.rpc.blxrbdn.com",
      "https://ethereum-mainnet.gateway.tatum.io",
      "https://uk.rpc.blxrbdn.com",
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
      "https://binance.llamarpc.com",
      "https://bsc-pokt.nodies.app",
      "https://bsc.rpc.blxrbdn.com",
    ],
  },
  42161: {
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
};
