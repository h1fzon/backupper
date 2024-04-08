import { ms } from "https://deno.land/x/ms@v0.1.0/ms.ts";
import scrape from "./cheapwl_scrape.ts";
import { WLData } from "./cheapwl_scrape.ts";

interface Candle {
  open: number;
  close: number;
  high: number;
  low: number;
}

// use when developing

// import "https://deno.land/std@0.221.0/dotenv/load.ts";

// const kv = await Deno.openKv(
//   "https://api.deno.com/databases/eb9996bc-c5b3-4458-b640-58727f727b4c/connect"
// );

const kv = await Deno.openKv();

export async function record() {
  const data = await scrape();
  await kv.set(["entry", Date.now()], data);
  return data;
}

export async function get_from_timeframe(time = "all") {
  const arr = [];

  const entries = kv.list({ prefix: ["entry"] });
  for await (const entry of entries) {
    if (time === "all") {
      arr.push(entry);
      continue;
    }
    if (Date.now() - (entry.key[1] as number) <= (ms(time) as number)) {
      arr.push(entry);
    }
  }
  return Promise.all(arr) as Promise<Deno.KvEntry<WLData>[]>;
}

export async function purge(time = "all") {
  const entries = kv.list({ prefix: ["entry"] });
  for await (const entry of entries) {
    if (time && time !== "all") {
      if (Date.now() - (entry.key[1] as number) > (ms(time) as number))
        continue;
    }
    await kv.delete(entry.key);
  }
}

export async function generate_candle_buy(): Promise<Candle> {
  const day_data = await get_from_timeframe("25h");
  const day_data_price_sorted = day_data.sort(
    (a, b) => a.value.buy_price - b.value.buy_price
  );
  return {
    open: day_data.filter((v) => v.key === day_data[0].key)[0].value.buy_price,
    close: day_data.filter(
      (v) => v.key === day_data[day_data.length - 1].key
    )[0].value.buy_price,
    high: day_data_price_sorted[0].value.buy_price,
    low: day_data_price_sorted[day_data_price_sorted.length - 1].value
      .buy_price,
  };
}

export async function generate_candle_sell(): Promise<Candle> {
  const day_data = await get_from_timeframe("25h");
  const day_data_price_sorted = day_data.sort(
    (a, b) => a.value.sell_price - b.value.sell_price
  );
  return {
    open: day_data.filter((v) => v.key === day_data[0].key)[0].value.sell_price,
    close: day_data.filter(
      (v) => v.key === day_data[day_data.length - 1].key
    )[0].value.sell_price,
    high: day_data_price_sorted[0].value.sell_price,
    low: day_data_price_sorted[day_data_price_sorted.length - 1].value
      .sell_price,
  };
}

interface CandleRecord {
  sell_candle: Candle;
  buy_candle: Candle;
}

export async function record_candle() {
  const sell_candle = await generate_candle_sell();
  const buy_candle = await generate_candle_buy();
  return await kv.set(["candle", Date.now() - 8.64e7], {
    sell_candle,
    buy_candle,
  } as CandleRecord);
}
console.log(await generate_candle_buy(), await generate_candle_sell());
