import { ms } from "https://deno.land/x/ms@v0.1.0/ms.ts";
import scrape from "./cheapwl_scrape.ts";

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
  return Promise.all(arr);
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
