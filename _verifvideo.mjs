/* La règle des 15 secondes, vérifiée avec de VRAIES vidéos (ffmpeg),
   et l'état final du mur quand Cloudinary ne répond pas. */
import { chromium } from "playwright";
const BASE = "http://localhost:7501";
const b = await chromium.launch({ channel: "msedge" });
const ctx = await b.newContext({ viewport: { width: 1380, height: 900 }, reducedMotion: "reduce" });
const p = await ctx.newPage();
const leads = [];
p.on("request", (r) => { if (r.url().includes("/api/lead")) leads.push(r.postData()); });
await p.route("https://api.cloudinary.com/**", (r) =>
  r.fulfill({ status: 200, contentType: "application/json", body: "{}" }));

await p.goto(BASE + "/galerie/", { waitUntil: "networkidle" });
await p.locator("#community").scrollIntoViewIfNeeded();
await p.waitForTimeout(6000);   // on laisse le mur finir sa requête

console.log("C. état final du mur (Cloudinary injoignable) :",
  JSON.stringify((await p.locator("#community-grid").innerText()).trim().slice(0, 110)));
console.log("   libellé des limites :",
  JSON.stringify((await p.locator(".cm-hint").innerText()).trim()));

const status = p.locator("#community-status");
await p.locator("#cm-author").fill("Mehdi");
await p.locator("#cm-phone").fill("06 12 34 56 78");

/* --- I. vidéo de 22 s : doit être REFUSÉE --- */
await p.locator("#cm-file").setInputFiles("C:/tmp/bcm/long22s.mp4");
await p.locator('#community-form button[type="submit"]').click();
await p.waitForTimeout(2500);
console.log("I. vidéo 22 s →", JSON.stringify(await status.innerText()));

/* --- J. vidéo de 8 s : doit PASSER --- */
await p.locator("#cm-file").setInputFiles("C:/tmp/bcm/short8s.mp4");
await p.locator('#community-form button[type="submit"]').click();
await p.waitForTimeout(6000);
console.log("J. vidéo 8 s →", JSON.stringify(await status.innerText()));
console.log("   carnet :", leads.length ? leads[leads.length - 1] : "❌ AUCUN");

await b.close();
