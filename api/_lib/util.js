/* =====================================================================
   Fonctions serverless — Boxing Center Minimes.
   Helpers partagés : CORS, auth admin en temps constant, lecture du
   contenu éditable, et le petit client KV (REST Upstash / Vercel KV)
   qui sert de carnet de leads. Aucune dépendance npm : tout passe par
   `fetch` — la fonction démarre à froid en quelques millisecondes.
   ===================================================================== */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash, timingSafeEqual } from "node:crypto";

export function allowCors(res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-token");
}

/** Auth backoffice. Comparaison en temps constant, et refus net si le
 *  secret n'est pas configuré (jamais de porte ouverte par défaut). */
export function isAdmin(req) {
  if (!process.env.ADMIN_TOKEN) return false;
  const given = createHash("sha256").update(String(req.headers["x-admin-token"] || "")).digest();
  const good = createHash("sha256").update(process.env.ADMIN_TOKEN).digest();
  return timingSafeEqual(given, good);
}

export function body(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") { try { return JSON.parse(req.body || "{}"); } catch { return {}; } }
  return req.body;
}

export function ipOf(req) {
  return (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket?.remoteAddress || "0.0.0.0";
}

/* ---------- le filtre d'injures (prénoms et titres du public) ----------
   Première ligne de défense côté SERVEUR : le client a le même filtre,
   mais un client se contourne. Ce qui passe ici part quand même en file
   de modération — rien n'est publié sans un humain. */
const BADWORDS = [
  "merde", "putain", "connard", "connasse", "salope", "encule", "pute", "bite", "couille", "nique",
  "ntm", "pd", "pede", "tapette", "bougnoule", "negro", "negre", "youpin", "salaud",
  "fuck", "shit", "bitch", "cunt", "nigger", "faggot", "whore", "rape", "nazi", "kys", "porn", "sex",
];

/** Valide et nettoie un nom saisi par un visiteur. Renvoie { value, bad }. */
export function cleanName(s, max) {
  const value = String(s || "").trim().slice(0, max).replace(/[=|<>]/g, ""); // on coupe ce qui casse le contexte / le HTML
  const norm = value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s]/g, " ");
  const bad =
    /(.)\1{6,}/.test(norm) ||                              // spam (aaaaaaa)
    /https?:|www\.|\.[a-z]{2,}\/?/i.test(value) ||         // liens
    BADWORDS.some((w) => new RegExp(`\\b${w}`, "i").test(norm));
  return { value, bad };
}

/** Le contenu éditable par le backoffice, bundlé au déploiement.
 *  Chaque publication redéploie → le bot et le site restent synchrones. */
export function siteContent() {
  try { return JSON.parse(readFileSync(join(process.cwd(), "src/content.json"), "utf8")); }
  catch { return null; }
}

/* ---------- le carnet de leads (KV REST : Vercel KV ou Upstash) ---------- */
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
export const KV_KEY = "bc:minimes:leads";
export const kvReady = () => Boolean(KV_URL && KV_TOKEN);

/** Appelle l'API REST du KV. `cmd` = tableau de commandes Redis. */
export async function kv(cmd) {
  if (!kvReady()) throw new Error("kv-not-configured");
  const r = await fetch(KV_URL.replace(/\/$/, ""), {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  if (!r.ok) throw new Error("kv " + r.status);
  const j = await r.json();
  return j.result;
}

/* ---------- GitHub (publication du contenu depuis le backoffice) ---------- */
export const GH_REPO = process.env.GITHUB_REPO || "";
export const GH_BRANCH = process.env.GITHUB_BRANCH || "main";

export function gh(path, init = {}) {
  return fetch(`https://api.github.com/repos/${GH_REPO}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "bc-minimes-admin",
      ...(init.headers || {}),
    },
  });
}
