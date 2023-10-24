import { CONST, rpc, sc, u, wallet } from "@cityofzion/neon-core";
import { CONNECTOR_ADDRESS } from "constants/connector-address";
import { getRPCClient } from "env";
import { append } from "queue";
import { BridgeMessage } from "types/BridgeMessage";
import { littleEndianToBigEndian } from "utils/index";
import { base64ToAddress, base64ToScriptHash } from "utils/tool/util/convert";
import { watch } from "utils/watch";
const _ = require("lodash");
const rpcClient = getRPCClient();

export async function watchNeo() {
  const network = "neo_testnet";

  watch(network, async (startBlockNumber) => {
    const currentBlockNumber = await rpcClient.getBlockCount();
    for (const i of _.range(startBlockNumber, currentBlockNumber)) {
      const notifications = await fetchNotifications(i);
      append(notifications);
    }
    return currentBlockNumber;
  });
}

const connectorAddress = CONNECTOR_ADDRESS.neo_testnet.toLowerCase();

async function fetchNotifications(i: number) {
  console.log("block", i);
  const block = await rpcClient.getBlock(i, true);
  if (!block.tx.length) {
    return [];
  }
  const res = await rpcClient.executeAll<
    { executions: rpc.ApplicationLogJson["executions"]; txId: string }[]
  >(block.tx.map((tx) => rpc.Query.getApplicationLog(tx.hash)));
  return _.flatMap(
    _.flatMap(
      res.map((tx) =>
        tx.executions.map((i) => ({ ...i.notifications, txId: tx.txId }))
      )
    )
  )
    .filter((i) => i.contract.toLowerCase() === connectorAddress)
    .map((i) => toDTO(i.txId, i.state));
}
function toDTO(txId: string, state: sc.StackItemJson): BridgeMessage {
  const res = makeResult(state);
  return {
    txHash: txId,
    sourceChainId: CONST.MAGIC_NUMBER.TestNet,
    txOriginAddress: `0x${wallet.getScriptHashFromAddress(res.getAddress(0))}`,
    txSenderAddress: `0x${wallet.getScriptHashFromAddress(res.getAddress(1))}`,
    destinationChainId: res.getBigInteger(2),
    destinationAddress: `0x${wallet.getScriptHashFromAddress(
      res.getAddress(3)
    )}`,
    destinationGasLimit: res.getBigInteger(4),
    message: `0x${res.getHex(5, true)}`,
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
