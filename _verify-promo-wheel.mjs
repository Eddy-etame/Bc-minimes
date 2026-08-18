import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/PC/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const out = "C:/Users/PC/Desktop/minime/Bc-minimes/.tmp/promo-wheel";
const routes = ["/", "/tarifs/", "/activites/", "/contact/"];
const viewports = [
  { w: 1365, h: 850, n: "desk" },
  { w: 390, h: 844, n: "mob" },
];

const b = await chromium.launch({ channel: "msedge" });
await mkdir(out, { recursive: true });

for (const route of routes) {
  for (const vp of viewports) {
    const ctx = await b.newContext({
      viewport: { width: vp.w, height: vp.h },
      deviceScaleFactor: 1,
    });
    const p = await ctx.newPage();
    const errs = [];
    p.on("console", (m) => {
      if (m.type() === "error") errs.push(m.text());
    });
    p.on("pageerror", (e) => errs.push(`PAGEERROR ${e.message}`));
    await p.goto(`http://127.0.0.1:4321${route}`, { waitUntil: "networkidle" });
    await p.evaluate(() => window.scrollTo(0, Math.round(innerHeight * 1.2)));
    await p.waitForTimeout(900);
    const info = await p.evaluate(() => {
      const el = document.querySelector(".promo-wheel");
      const a = el?.querySelector("a");
      const r = el?.getBoundingClientRect();
      const ab = document.querySelector(".actionbar")?.getBoundingClientRect();
      return {
        exists: !!el,
        cls: el?.className,
        href: a?.href,
        text: el?.textContent.trim().replace(/\s+/g, " ").slice(0, 180),
        box: r && {
          x: Math.round(r.x),
          y: Math.round(r.y),
          w: Math.round(r.width),
          h: Math.round(r.height),
          bottom: Math.round(innerHeight - r.bottom),
        },
        actionbar: ab && { y: Math.round(ab.y), h: Math.round(ab.height) },
        overflow: document.documentElement.scrollWidth - innerWidth,
      };
    });
    const name = route.replace(/[^a-z0-9]+/gi, "_") || "home";
    await p.screenshot({ path: `${out}/promo_${name}_${vp.n}.png`, fullPage: false });
    console.log(route, vp.n, JSON.stringify(info), errs.length ? `ERR ${errs.join(" | ")}` : "OK");
    await ctx.close();
  }
}

await b.close();
