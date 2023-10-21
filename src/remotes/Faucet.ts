import { getSigner } from "constants/env";
import { NETWORKS } from "constants/networks";
import { ethers } from "ethers";
import { groupBy } from "lodash";
import { Request } from "../Request";

const FAUCET_ADDRESS = {
  neo: "0x2429fC6FEDbfCe6f91E7048eFc2328AdfbBAe755",
  zeta: "0xAd0Bc3A152355CFa13b36DC953272bAD305DE7E0",
};

export namespace Faucet {
  export async function drip(list: Request[]) {
    const successful = [];
    const failure = [];

    for (const [network, targets] of Object.entries(
      groupBy(list, (i) => i.network)
    )) {
      try {
        const [url, name, chainId] = NETWORKS[network];
        const address = FAUCET_ADDRESS[chainId];
        const signer = getSigner(url, name, chainId);
        const faucet = new ethers.Contract(address, abi, signer);
        const addresses = targets.map((i) => i.address);
        await faucet.drip(addresses);
        successful.push(...targets);
      } catch (e) {
        console.error(e);
        failure.push(...targets);
      }
    }
    return { successful, failure };
  }
}

const abi = require("./abis/Faucet.json");
