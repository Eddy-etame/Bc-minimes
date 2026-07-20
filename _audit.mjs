/* AUDIT SUR LE RENDU — pas sur la source.
   1. plus un seul pixel rouge sur les 9 pages (capture pleine page) ;
   2. contraste réel du corps de texte et des petits libellés ;
   3. le focus clavier reste visible. */
import { chromium } from "playwright";
import sharp from "sharp";
const BASE = "http://localhost:7501";
const ROUTES = ["/", "/activites/", "/coachs/", "/galerie/", "/le-club/", "/plannings/", "/tarifs/", "/contact/", "/rien-du-tout"];

const b = await chromium.launch({ channel: "msedge" });
const ctx = await b.newContext({ viewport: { width: 1380, height: 900 }, reducedMotion: "reduce" });
const p = await ctx.newPage();

const L = ([r, g, b_]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b_); };
const ratio = (a, c) => { const [x, y] = [L(a), L(c)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const parse = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);

console.log("=== 1. CHASSE AU ROUGE (pixels réellement rendus) ===");
for (const route of ROUTES) {
  await p.goto(BASE + route, { waitUntil: "networkidle" }).catch(() => {});
  await p.waitForTimeout(700);
  const buf = await p.screenshot({ fullPage: true });
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  let red = 0, total = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i], g = data[i + 1], bl = data[i + 2];
    total++;
    /* « rouge » = canal rouge nettement dominant sur les deux autres */
    if (r > 90 && r - g > 45 && r - bl > 45) red++;
  }
  console.log(`  ${route.padEnd(14)} ${info.width}×${info.height}  pixels rouges : ${red} ${red === 0 ? "✅" : "❌"}`);
}

console.log("\n=== 2. CONTRASTES MESURÉS (page d'accueil) ===");
await p.goto(BASE + "/", { waitUntil: "networkidle" });
await p.waitForTimeout(700);
const c = await p.evaluate(() => {
  const bg = (el) => { let n = el; while (n && n !== document.documentElement) {
      const s = getComputedStyle(n).backgroundColor;
      if (s && !/rgba?\(0, 0, 0, 0\)|transparent/.test(s)) return s; n = n.parentElement; }
    return getComputedStyle(document.body).backgroundColor; };
  const pick = (sel, label) => { const el = document.querySelector(sel); if (!el) return null;
    const s = getComputedStyle(el);
    return { label, sel, fg: s.color, bg: bg(el), size: s.fontSize, weight: s.fontWeight }; };
  return [
    pick("body", "corps (body)"),
    pick(".hero__sub", "accroche du héros"),
    pick(".stat__l", "libellé de statistique"),
    pick(".eyebrow", "eyebrow"),
    pick(".tint", "le mot d'accent (.tint)"),
    pick(".btn--primary", "CTA principal"),
    pick(".footer__col a", "lien de pied de page"),
    pick(".nav__links a", "lien de navigation"),
  ].filter(Boolean);
});
for (const x of c) {
  const r = ratio(parse(x.fg), parse(x.bg));
  const big = parseFloat(x.size) >= 24 || (parseFloat(x.size) >= 18.66 && +x.weight >= 700);
  const need = big ? 3 : 4.5;
  console.log(`  ${x.label.padEnd(26)} ${r.toFixed(2)}:1  (${x.size}, seuil ${need}) ${r >= need ? "✅" : "❌"}`);
}

console.log("\n=== 3. FOCUS CLAVIER VISIBLE ===");
const f = await p.evaluate(() => {
  const a = document.querySelector(".nav__links a"); a.focus();
  const s = getComputedStyle(a);
  return { outlineColor: s.outlineColor, outlineWidth: s.outlineWidth, outlineStyle: s.outlineStyle };
});
console.log("  ", JSON.stringify(f));

await b.close();
