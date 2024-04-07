import * as kv_a from "./abstractor_kv.ts";
if (Deno.args[0] === "record") await kv_a.record();
else if (Deno.args[0] === "purge") {
  if (Deno.args[1]) await kv_a.purge(Deno.args[1]);
  else await kv_a.purge();
} else if (Deno.args[0] === "gft") {
  if (Deno.args[1]) console.log(await kv_a.get_from_timeframe(Deno.args[1]));
  else console.log(await kv_a.get_from_timeframe());
} else {
  console.log(`thingamajig utility cli\navailable command: record, purge, gft`);
}
