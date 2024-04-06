import { Application } from "https://deno.land/x/oak@14.2.0/mod.ts";
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

const app = new Application();
app.use(async (ctx) => {
  let data = yoink();
  if (Date.now() - data[0].timestamp >= 8.64e7 || data.length == 0) {
    data = await record();
  }
  ctx.response.body = JSON.stringify(data);
});

await app.listen({ port: 8000 });
