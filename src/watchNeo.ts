import { rpc, sc, u } from "@cityofzion/neon-core";
import { CONNECTOR_ADDRESS } from "constants/connector-address";
import { getRPCClient } from "env";
import { flatMap, range } from "lodash";
import { watch } from "utls/watch";
import { BridgeMessageSent } from "types/BridgeMessageSent";
import { littleEndianToBigEndian } from "utls";
import { base64ToAddress, base64ToScriptHash } from "utls/tool/util/convert";

export async function watchNeo() {
  const rpcClient = getRPCClient();
  const network = "neo_testnet";

  watch(network, async (startBlockNumber) => {
    const currentBlockNumber = await rpcClient.getBlockCount();
    for (const i of range(startBlockNumber, currentBlockNumber)) {
      const notifications = await fetchNotifications(i);
      console.log(notifications);
    }
    return currentBlockNumber;
  });
}

const connectorAddress = CONNECTOR_ADDRESS.neo_testnet.toLowerCase();

async function fetchNotifications(i: number) {
  console.log("block", i);
  const rpcClient = getRPCClient();
  const block = await rpcClient.getBlock(i, true);
  if (!block.tx.length) {
    return [];
  }
  const res = await rpcClient.executeAll<
    { executions: rpc.ApplicationLogJson["executions"] }[]
  >(block.tx.map((tx) => rpc.Query.getApplicationLog(tx.hash)));
  return flatMap(
    flatMap(res.map((tx) => tx.executions.map((i) => i.notifications)))
  )
    .filter((i) => i.contract.toLowerCase() === connectorAddress)
    .map((i) => toDTO(i.state));
}
function toDTO(state: sc.StackItemJson): BridgeMessageSent {
  const res = makeResult(state);
  return {
    txOriginAddress: res.getAddress(0),
    txSenderAddress: res.getAddress(1),
    destinationChainId: res.getBigInteger(2),
    destinationAddress: `0x${res.getHex(3)}`,
    destinationGasLimit: res.getBigInteger(4),
    message: res.getHex(5),
    bridgeParams: res.getHex(6),
  };
}
function makeResult<T>(data: sc.StackItemJson) {
  const getValue = <V = T>(idx: number) =>
    new sc.StackItem(data.value[idx]).value as V;
  const getString = (idx: number) =>
    u.HexString.fromBase64(getValue<string>(idx)).toAscii();
  const getAddress = (idx: number) => base64ToAddress(getValue<string>(idx));
  const getBigInteger = (idx: number) => getValue<string>(idx);
  const getScriptHash = (idx: number) =>
    base64ToScriptHash(getValue<string>(idx));
  const getHex = (idx: number, littleEndian?: boolean) => {
    const rawHex = u.base642hex(getValue<string>(idx));
    return littleEndian ? littleEndianToBigEndian(rawHex) : rawHex;
  };
  return {
    ...data,
    getValue,
    getAddress,
    getString,
    getScriptHash,
    getBigInteger,
    getHex,
  };
}
