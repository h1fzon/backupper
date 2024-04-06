import * as fs from "https://deno.land/std@0.221.0/fs/mod.ts";
import scrape from "./cheapwl-scrape.ts";

interface WLRecord {
  sell_price: number;
  buy_price: number;
  timestamp: number;
}

const yoink = () =>
  JSON.parse(Deno.readTextFileSync("./price.json")) as WLRecord[];

async function record() {
  const data = await scrape();
  if (!fs.existsSync("./price.json"))
    Deno.writeTextFileSync("./price.json", "[]");
  const previous_data = JSON.parse(Deno.readTextFileSync("./price.json"));
  previous_data.push({
    ...data,
    timestamp: Date.now(),
  });
  Deno.writeTextFileSync("./price.json", JSON.stringify(previous_data));
  return yoink();
}

async function handler(_req: Request): Promise<Response> {
  let data = yoink();
  if (data.length == 0) data = await record();
  // if (data[-1].timestamp > 8.64e7) data = await record();
  return new Response(JSON.stringify(data));
}

Deno.cron("Fetch WL", "0 0 * * *", async () => {
  await record();
});

Deno.serve({ port: 8080 }, handler);
