/* La lecture des métadonnées vidéo passe par une URL blob:.
   Est-ce la CSP de production qui la refuse, ou l'automatisation ? */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const b = await chromium.launch({ channel: "msedge" });
const buf = readFileSync("C:/tmp/bcm/short8s.mp4").toString("base64");

const probe = async (label, url, csp) => {
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  const viol = [];
  p.on("console", (m) => { if (/Content Security Policy|Refused to load/i.test(m.text())) viol.push(m.text().slice(0, 160)); });
  if (csp) {
    /* on sert une page nue portant EXACTEMENT la CSP de production */
    await p.route("**/pagenue", (r) => r.fulfill({ status: 200, contentType: "text/html", headers: { "Content-Security-Policy": csp }, body: "<!doctype html><title>nue</title>" }));
  }
  await p.goto(url);
  const r = await p.evaluate(async (b64) => {
    const bin = atob(b64); const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    const file = new File([u], "v.mp4", { type: "video/mp4" });
    return await new Promise((res) => {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => res({ ok: true, w: v.videoWidth, d: +v.duration.toFixed(2) });
      v.onerror = () => res({ ok: false, code: v.error?.code, msg: v.error?.message });
      setTimeout(() => res({ ok: false, msg: "timeout" }), 5000);
      v.src = URL.createObjectURL(file);
    });
  }, buf);
  console.log(label, JSON.stringify(r), viol.length ? "| CSP:" + viol.join(" ") : "");
  await ctx.close();
};

const CSP = JSON.parse(readFileSync("vercel.json", "utf8")).headers[0].headers.find((h) => h.key === "Content-Security-Policy").value;
await probe("1. page SANS aucune CSP (about:blank) :", "about:blank", null);
await probe("2. page AVEC la CSP de production   :", "http://localhost:7501/pagenue", CSP);
await probe("3. la vraie page /galerie/ servie   :", "http://localhost:7501/galerie/", null);
await b.close();
