import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const b = await chromium.launch({ channel: "msedge" });
const p = await (await b.newContext()).newPage();
await p.goto("http://localhost:7501/galerie/");
const buf = readFileSync("C:/tmp/bcm/short8s.mp4").toString("base64");
const out = await p.evaluate(async (b64) => {
  const bin = atob(b64); const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  const file = new File([u], "short8s.mp4", { type: "video/mp4" });

  /* ce que voit la reniflette */
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const ascii = (a, z) => String.fromCharCode(...head.slice(a, z));

  /* ce que fait le navigateur avec la vidéo */
  const meta = await new Promise((res) => {
    const v = document.createElement("video");
    const url = URL.createObjectURL(file);
    v.preload = "metadata";
    v.onloadedmetadata = () => res({ ev: "loadedmetadata", w: v.videoWidth, h: v.videoHeight, d: v.duration });
    v.onerror = () => res({ ev: "error", code: v.error?.code, msg: v.error?.message });
    setTimeout(() => res({ ev: "timeout", w: v.videoWidth, d: v.duration, ready: v.readyState }), 6000);
    v.src = url;
  });
  return { magic4_8: ascii(4, 8), brand: ascii(8, 12), canPlay: document.createElement("video").canPlayType("video/mp4"), meta };
}, buf);
console.log(JSON.stringify(out, null, 1));
await b.close();
