/* =====================================================================
   PREUVE — LE MUR DU CLUB, sur le RENDU de dist/, avec de vrais gestes.
   Rien n'est simulé : Cloudinary est le vrai compte, Gemini les vraies
   clés, et les handlers de api/ sont ceux que Vercel exécutera.
     node _preuve-galerie.mjs
   ===================================================================== */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";

const BASE = "http://localhost:7812";
const M = "C:/tmp/bcm-media";
const ok = (b) => (b ? "OK" : "ECHEC");
const results = [];
const note = (label, pass, detail = "") => { results.push([label, pass, detail]); console.log(`${pass ? "[OK]  " : "[FAIL]"} ${label}${detail ? " — " + detail : ""}`); };

const b = await chromium.launch({ channel: "msedge" });
const ctx = await b.newContext({ viewport: { width: 1380, height: 950 }, reducedMotion: "reduce" });
const p = await ctx.newPage();

const reqs = [];
const leadPosts = [];
const errs = [];
p.on("request", (r) => {
  reqs.push(r.url());
  if (r.url().includes("/api/lead") && r.method() === "POST") leadPosts.push(r.postData());
});
p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
p.on("pageerror", (e) => errs.push("PAGEERROR " + e.message));

/* ===== 4. PERF — le premier rendu ne doit RIEN charger de la feature ===== */
await p.goto(BASE + "/galerie/", { waitUntil: "networkidle" });
await p.waitForTimeout(600);
const early = reqs.filter((u) => /assets\/(js|css)\/community\./.test(u));
note("PERF · premier rendu sans le JS/CSS du mur", early.length === 0,
  early.length ? "CHARGES: " + early.join(", ") : `0 requete community.* sur ${reqs.length} requetes`);

/* le module descend quand la section approche */
await p.locator("#community").scrollIntoViewIfNeeded();
await p.waitForTimeout(2000);
const late = reqs.filter((u) => /assets\/(js|css)\/community\./.test(u));
note("PERF · a l'approche, le module descend", late.length >= 2,
  late.map((u) => u.split("/").pop()).join(", ") || "AUCUN");

const status = p.locator("#community-status");
const fill = async (o) => {
  for (const [k, v] of Object.entries(o)) {
    const el = p.locator(`#community-form [name="${k}"]`);
    await el.fill(String(v));
  }
};
const setFile = (f) => p.locator('#community-form input[type="file"]').setInputFiles(f);
const submit = () => p.locator('#community-form button[type="submit"]').click();
const waitMsg = async (re, timeout = 45000) => {
  await p.waitForFunction(
    ([sel, src]) => new RegExp(src, "i").test(document.querySelector(sel)?.textContent || ""),
    ["#community-status", re.source], { timeout }
  ).catch(() => {});
  return (await status.textContent())?.trim() || "";
};

/* ===== 2a. REFUS — un fichier qui n'est ni photo ni video ===== */
await fill({ author: "Karim", email: "karim.test@example.com", title: "Un document" });
await setFile(M + "/pasunmedia.txt");
await submit();
let msg = await waitMsg(/ni une photo|pas ce qu'il pretend|n'est ni/i, 15000);
note("REFUS · fichier non media", /ni une photo ni une video|n'est pas ce qu'il pretend/i.test(msg.normalize("NFD").replace(/[̀-ͯ]/g, "")), JSON.stringify(msg));

/* ===== 2b. REFUS — une video de 20 s (limite 15 s) ===== */
await setFile(M + "/long20s.mp4");
await submit();
msg = await waitMsg(/trop longue/i, 20000);
note("REFUS · video 20 s > 15 s", /trop longue/i.test(msg), JSON.stringify(msg));

/* ===== 2c. REFUS — un prenom injurieux ===== */
await fill({ author: "connard", email: "karim.test@example.com" });
await setFile(M + "/salle.jpg");
await submit();
msg = await waitMsg(/prenom|passe pas/i, 15000);
note("REFUS · prenom injurieux", /ne passe pas/i.test(msg), JSON.stringify(msg));

/* ===== 2d. REFUS PAR L'OEIL — une capture d'ecran, pas une photo du club ===== */
/* Une VRAIE capture d'ecran d'un document texte. On ne capture PAS la
   page galerie : elle est pleine de photos de la salle, et le modele a
   raison de laisser passer ce qui ressemble a une salle de boxe. Le
   fixture doit etre stable et franchement hors sujet. */
const doc = await ctx.newPage();
await doc.setContent(`<body style="font:16px/1.6 Georgia,serif;background:#fff;color:#111;padding:40px">
  <h1>Attestation d'assurance habitation</h1>
  <p>Numero de contrat : 4471-889-02 — Souscripteur : M. Dupont Jean-Claude</p>
  <p>La presente atteste que le bien situe 12 rue des Lilas est couvert au titre
  des garanties multirisques habitation, degats des eaux, incendie et
  responsabilite civile, pour la periode du 1er janvier au 31 decembre.</p>
  <table border="1" cellpadding="8"><tr><th>Garantie</th><th>Plafond</th><th>Franchise</th></tr>
  <tr><td>Incendie</td><td>150 000 EUR</td><td>150 EUR</td></tr>
  <tr><td>Degats des eaux</td><td>80 000 EUR</td><td>150 EUR</td></tr>
  <tr><td>Vol</td><td>25 000 EUR</td><td>300 EUR</td></tr></table>
  <p>Fait a Toulouse, le 20 juillet. Signature et cachet de l'assureur.</p></body>`);
await doc.screenshot({ path: M + "/capture.png" });
await doc.close();
await fill({ author: "Karim", email: "karim.test@example.com", title: "Capture" });
await setFile(M + "/capture.png");
await submit();
msg = await waitMsg(/rien a faire|mur du club|recu|coach/i, 45000);
const rejeteParOeil = /rien a faire sur le mur/i.test(msg.normalize("NFD").replace(/[̀-ͯ]/g, ""));
note("VISION · capture d'ecran ecartee par l'oeil", rejeteParOeil, JSON.stringify(msg));

/* ===== 1. LE DEPOT COMPLET — vrais gestes, vrai Cloudinary ===== */
const PRENOM = "Karim";
const EMAIL = "karim.test@example.com";
const TITRE = "Le ring des Minimes " + Date.now().toString(36).slice(-4);
leadPosts.length = 0;
await fill({ author: PRENOM, email: EMAIL, title: TITRE });
await setFile(M + "/salle.jpg");
await submit();
msg = await waitMsg(/recu|coach|echoue|refus/i, 60000);
note("DEPOT · photo acceptee, message de coach", /Recu, Karim/i.test(msg.normalize("NFD").replace(/[̀-ͯ]/g, "")), JSON.stringify(msg));

await p.waitForTimeout(1500);
const lead = leadPosts.map((s) => { try { return JSON.parse(s); } catch { return {}; } })
  .find((l) => l.event === "upload_contributor");
note("LEAD · POST /api/lead event=upload_contributor", Boolean(lead),
  lead ? JSON.stringify({ event: lead.event, prenom: lead.prenom, email: lead.email, salle: lead.salle }) : "AUCUN POST");

/* ===== 3. LA MODERATION — le media est en attente, cote serveur ===== */
const TOKEN = process.env.ADMIN_TOKEN;
const api = (path, init = {}) => fetch(BASE + path, { ...init, headers: { "x-admin-token": TOKEN, "Content-Type": "application/json", ...(init.headers || {}) } }).then((r) => r.json());

let pending = await api("/api/community/pending");
const mine = (pending.items || []).find((i) => i.title === TITRE);
note("MODERATION · le depot est en file 'pending'", Boolean(mine),
  mine ? `id=${mine.id} auteur=${mine.author} contact=${mine.contact} vision=${mine.vision}` : "introuvable");
note("MODERATION · le contact du deposant suit le media", mine?.contact === EMAIL, mine?.contact || "vide");

/* le mur public ne doit PAS encore le montrer */
let items = await fetch(BASE + "/api/community/items").then((r) => r.json());
note("MODERATION · invisible du public avant approbation",
  !(items.items || []).some((i) => i.title === TITRE), `${(items.items || []).length} media(s) publics`);

/* --- fuite de donnees : le contact ne doit JAMAIS sortir en public --- */
const rawPublic = await fetch(BASE + "/api/community/items").then((r) => r.text());
note("VIE PRIVEE · aucun contact dans la reponse publique", !rawPublic.includes(EMAIL) && !rawPublic.includes("contact"),
  rawPublic.includes(EMAIL) ? "FUITE DE L'EMAIL" : "aucune trace");

/* ===== 3 bis. LA MODERATION DANS /admin/, avec de vrais clics ===== */
const ap = await ctx.newPage();
/* la visite guidee du vestiaire se declenche a la premiere connexion et
   pose un voile par-dessus l'interface : on la marque comme deja vue,
   exactement comme le ferait un staff qui l'a terminee une fois. */
await ap.addInitScript(() => { try { localStorage.setItem("bcm:tour:v1", "1"); } catch (e) {} });
await ap.goto(BASE + "/admin/", { waitUntil: "networkidle" });
await ap.locator("#token").fill(TOKEN);
await ap.locator("#loginBtn").click();
await ap.waitForTimeout(2500);

const badge = await ap.locator('.navbtn[data-k="community"] .nbadge').textContent().catch(() => null);
note("ADMIN · compteur de la file dans le menu", Boolean(badge && +badge >= 1), "badge=" + badge);

await ap.locator('.navbtn[data-k="community"]').click();
await ap.waitForTimeout(2500);
const cardTxt = await ap.locator(".modcard").filter({ hasText: TITRE }).innerText().catch(() => "");
note("ADMIN · la carte affiche prenom + contact + date", cardTxt.includes(PRENOM) && cardTxt.includes(EMAIL), JSON.stringify(cardTxt.replace(/\n/g, " | ")));

/* APPROUVER, pour de vrai */
await ap.locator(".modcard").filter({ hasText: TITRE }).locator("button", { hasText: "Approuver" }).click();
/* L'index de recherche Cloudinary n'est pas instantane : le retag est
   pris en compte tout de suite, mais la recherche qui alimente le mur
   met quelques secondes a le refleter. On laisse ce delai — l'affirmer
   en une seule lecture donnerait un faux echec (et, l'autre jour, un
   faux succes). */
let publie = null;
for (let i = 0; i < 12 && !publie; i++) {
  await ap.waitForTimeout(2500);
  items = await fetch(BASE + "/api/community/items").then((r) => r.json());
  publie = (items.items || []).find((x) => x.title === TITRE);
}
note("ADMIN · Approuver rend le media public", Boolean(publie), publie ? publie.src.slice(0, 68) + "..." : "toujours absent apres 30 s");

/* et il apparait sur la page, pour de vrai */
await p.goto(BASE + "/galerie/", { waitUntil: "networkidle" });
await p.locator("#community").scrollIntoViewIfNeeded();
await p.waitForTimeout(3000);
const wall = await p.locator("#community-grid").innerText();
/* la legende est passee en capitales par la feuille : on compare sans casse */
note("GALERIE · le media approuve est sur le mur", wall.toLowerCase().includes(TITRE.toLowerCase()), JSON.stringify(wall.trim().slice(0, 120)));

/* ===== SUPPRIMER — second depot, puis refus reel ===== */
const TITRE2 = "A supprimer " + Date.now().toString(36).slice(-4);
await fill({ author: "Sofia", email: "sofia.test@example.com", title: TITRE2 });
await setFile(M + "/short6s.mp4");
await submit();
msg = await waitMsg(/recu|echoue|refus|trop/i, 90000);
note("DEPOT · video de 6 s acceptee (sous la limite)", /Recu, Sofia/i.test(msg.normalize("NFD").replace(/[̀-ͯ]/g, "")), JSON.stringify(msg));

/* On attend que l'index de Cloudinary voie le nouveau depot avant
   d'ouvrir le vestiaire — sinon on cherche a l'ecran une carte qui
   n'existe pas encore, et on conclut a tort qu'elle a disparu. */
for (let i = 0; i < 12; i++) {
  const q = await api("/api/community/pending");
  if ((q.items || []).some((x) => x.title === TITRE2)) break;
  await ap.waitForTimeout(2500);
}
await ap.reload({ waitUntil: "networkidle" });
await ap.waitForTimeout(1500);
/* la session du vestiaire survit au rechargement : le formulaire de
   connexion n'est alors pas affiche. On ne se reconnecte que s'il l'est. */
if (await ap.locator("#token").isVisible().catch(() => false)) {
  await ap.locator("#token").fill(TOKEN);
  await ap.locator("#loginBtn").click();
  await ap.waitForTimeout(2500);
}
await ap.locator('.navbtn[data-k="community"]').click();
await ap.waitForTimeout(2500);
ap.on("dialog", (d) => d.accept());
const card2 = ap.locator(".modcard").filter({ hasText: TITRE2 });
const vu2 = await card2.count();
await card2.locator("button", { hasText: "Refuser" }).click();
/* la destruction est immediate cote Cloudinary, l'index suit */
let reste = true;
for (let i = 0; i < 10 && reste; i++) {
  await ap.waitForTimeout(2500);
  pending = await api("/api/community/pending");
  reste = (pending.items || []).some((x) => x.title === TITRE2);
}
note("ADMIN · Supprimer efface le depot", vu2 > 0 && !reste, `vu en file: ${vu2 > 0}, encore la apres: ${reste}`);

/* ===== a11y / etat ===== */
note("AUCUNE erreur console", errs.length === 0, errs.slice(0, 3).join(" | ") || "0");

/* ===== MENAGE — le compte Cloudinary est le VRAI compte du club.
   On retire tout ce que cette verification y a depose : les approuves
   comme les restants en file. On ne laisse pas nos brouillons sur le mur
   d'un client. ===== */
const estUnTest = (i) => /(karim|sofia)\.test@example\.com/i.test(i.contact || "") ||
  /^(Le ring des Minimes|A supprimer|Capture|Un document)/i.test(i.title || "");
let efface = 0;
for (const tag of ["approved", "pending"]) {
  const lot = tag === "pending" ? await api("/api/community/pending") : { items: (await fetch(BASE + "/api/community/items").then((r) => r.json())).items };
  for (const it of lot.items || []) {
    /* le mur public ne rend pas le contact : on s'appuie sur le titre */
    if (!estUnTest(it) && tag === "pending") continue;
    if (tag === "approved" && !/^(Le ring des Minimes|A supprimer|Capture)/i.test(it.title || "")) continue;
    await api("/api/community/moderate", { method: "POST", body: JSON.stringify({ id: it.id, kind: it.kind, action: "reject" }) });
    efface++;
    console.log("[menage] supprime :", it.id, "—", it.title);
  }
}
console.log(`[menage] ${efface} media(s) de test retires du compte Cloudinary`);

console.log("\n================ BILAN ================");
const passed = results.filter((r) => r[1]).length;
console.log(`${passed}/${results.length} verifications passees`);
results.filter((r) => !r[1]).forEach((r) => console.log("  ECHEC:", r[0], "—", r[2]));

await b.close();
