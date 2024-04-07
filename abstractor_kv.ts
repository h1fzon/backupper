import { ms } from "https://deno.land/x/ms@v0.1.0/ms.ts";
import scrape from "./cheapwl_scrape.ts";
import "https://deno.land/std@0.221.0/dotenv/load.ts";

const kv = await Deno.openKv(
  "https://api.deno.com/databases/eb9996bc-c5b3-4458-b640-58727f727b4c/connect"
);

export async function record() {
  const data = await scrape();
  await kv.set(["entry", Date.now()], data);
  return data;
}

export async function get_from_timeframe(time: string) {
  const arr = [];

  const entries = kv.list({ prefix: ["entry"] });
  for await (const entry of entries) {
    if (Date.now() - (entry.key[1] as number) <= (ms(time) as number)) {
      arr.push(entry);
    }
  }

  return Promise.all(arr);
}

export async function purge() {
  const entries = kv.list({ prefix: ["entry"] });
  for await (const entry of entries) {
    if (Date.now() - (entry.key[1] as number) <= 4.32e8) {
      await kv.delete(entry.key);
    }
  }
}
