import axios from "axios";
import { fromPairs } from "lodash";

const SYMBOL_MAP = {
  USDC: "USDCUSDT",
  USDT: "USDCUSDT",
  WETH: "ETHUSDT",
  ETH: "ETHUSDT",
  WBTC: "BTCUSDT",
  ARB: "ARBUSDT",
  BNB: "BNBUSDT",
  WBNB: "BNBUSDT",
  xBNB: "BNBUSDT",
  xMATIC: "MATICUSDC",
  GAS: "GASUSDT",
  WGAS: "GASUSDT",
  WGAS10: "GASUSDT",
};

export async function fetchCEXPrices() {
  const res = await axios.get<{ symbol: string; price: string }[]>(
    `https://api.binance.com/api/v3/ticker/price`
  );
  return fromPairs(
    Object.keys(SYMBOL_MAP).map((symbol) => [
      symbol,
      Number(res.data.find((i) => i.symbol === SYMBOL_MAP[symbol])?.price),
    ])
  );
}
