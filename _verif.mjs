import { chromium } from "playwright";
const OUT = "C:/tmp/bcm";
const BASE = "http://localhost:7501";
const b = await chromium.launch({ channel: "msedge" });

/* --- 1. la nav large : les deux sorties de marque doivent tenir --- */
const wide = await b.newContext({ viewport: { width: 1600, height: 700 }, reducedMotion: "reduce" });
const p1 = await wide.newPage();
await p1.goto(BASE + "/", { waitUntil: "networkidle" });
await p1.waitForTimeout(600);
await p1.locator(".nav").screenshot({ path: `${OUT}/nav1600.png` });
const navInfo = await p1.evaluate(() => {
  const boxes = [...document.querySelectorAll(".nav__links a, .nav__ext a, .nav__cta")].map((e) => {
    const r = e.getBoundingClientRect();
    return { t: e.textContent.trim().replace(/\s+/g, " "), x: Math.round(r.x), r: Math.round(r.right), h: Math.round(r.height) };
  });
  let overlap = [];
  for (let i = 1; i < boxes.length; i++) if (boxes[i].x < boxes[i - 1].r - 1) overlap.push(`${boxes[i - 1].t} ✕ ${boxes[i].t}`);
  const ext = [...document.querySelectorAll(".nav__ext a")].map((a) => ({ t: a.textContent.trim(), href: a.href, target: a.target, rel: a.rel }));
  return { overlap, ext, nlinks: boxes.length };
});
console.log("NAV 1600 :", JSON.stringify(navInfo, null, 1));

/* --- 2. le gant : lisible à 24px ? --- */
const p2 = await wide.newPage();
await p2.goto(BASE + "/", { waitUntil: "networkidle" });
await p2.waitForTimeout(500);
await p2.locator(".chatbot").screenshot({ path: `${OUT}/pastille.png` });
await p2.evaluate(() => {
  const svg = document.querySelector(".chatbot__icon svg").cloneNode(true);
  const d = document.createElement("div");
  d.id = "gantTest";
  d.style.cssText = "position:fixed;inset:0;z-index:99999;background:#0a1020;display:flex;gap:28px;align-items:center;justify-content:center";
  [16, 24, 32, 56, 120].forEach((s) => {
    const w = document.createElement("div");
    w.style.cssText = `color:#eef1f6;display:flex;flex-direction:column;align-items:center;gap:8px;font:600 11px sans-serif`;
    const c = svg.cloneNode(true); c.setAttribute("width", s); c.setAttribute("height", s);
    w.append(c); const l = document.createElement("span"); l.textContent = s + "px"; w.append(l);
    d.append(w);
  });
  document.body.append(d);
});
await p2.locator("#gantTest").screenshot({ path: `${OUT}/gant.png` });
console.log("gant capturé");

await b.close();
