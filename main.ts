import * as kv_a from "./abstractor_kv.ts";
import NetAbstractor from "./abstractor_net.ts";

const na = new NetAbstractor();

Deno.cron("Fetch WL", "0 */4 * * *", async () => {
  await kv_a.record();
});

na.get("/timeframe/5d", async () => {
  return new Response(JSON.stringify(await kv_a.get_from_timeframe("5d")));
});

na.serve();
