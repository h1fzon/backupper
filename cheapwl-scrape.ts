import * as ddom from "https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts?doc=";

export default async function cheapwl_scrape() {
  const page = await fetch("https://cheapwl.com/");
  const document = new ddom.DOMParser().parseFromString(
    await page.text(),
    "text/html"
  );
  const sell_price = parseInt(
    document
      ?.querySelector(
        "div.col-md-5:nth-child(1) > div:nth-child(2) > h2:nth-child(1)"
      )
      ?.innerText.substring(4)
      .replaceAll(",", "") as string
  );
  const buy_price = parseInt(
    document
      ?.querySelector(
        "div.col-md-5:nth-child(3) > div:nth-child(2) > h2:nth-child(1)"
      )
      ?.innerText.substring(4)
      .replaceAll(",", "") as string
  );
  return {
    sell_price,
    buy_price,
  };
}
