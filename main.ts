import * as fs from "https://deno.land/std@0.221.0/fs/mod.ts";
import scrape from "./cheapwl-scrape.ts";

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
}

record();
