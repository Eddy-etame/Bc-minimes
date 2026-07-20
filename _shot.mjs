import { chromium } from "playwright";
const OUT = "C:/tmp/bcm";
const BASE = "http://localhost:7501";

const b = await chromium.launch({ channel: "msedge" });
const ctx = await b.newContext({ viewport: { width: 1380, height: 900 }, reducedMotion: "reduce", deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
p.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));

const pages = process.argv.slice(2);
for (const route of pages) {
  const name = route.replace(/[^a-z0-9]+/gi, "_") || "home";
  await p.goto(BASE + route, { waitUntil: "networkidle" }).catch(() => {});
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  await p.screenshot({ path: `${OUT}/${name}_full.png`, fullPage: true });
  console.log("shot", route);
}
if (errs.length) console.log("CONSOLE ERRORS:\n" + errs.join("\n"));
else console.log("aucune erreur console");
await b.close();
