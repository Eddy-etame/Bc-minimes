/* =====================================================================
   Serveur de vérification LOCAL — sert dist/ + les VRAIES fonctions
   serverless de api/ (mêmes fichiers que Vercel exécute en ligne).
   Ce n'est pas un mock : les handlers sont importés tels quels, on
   adapte seulement la signature req/res de Vercel sur node:http.

     node scripts/serve-local.mjs [port]

   Sans clé d'IA dans l'environnement, /api/chat répond depuis sa base
   de connaissance locale — c'est exactement ce qui se passera en ligne
   si personne ne configure de clé.
   ===================================================================== */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, resolve } from "node:path";

const ROOT = resolve(process.cwd(), "dist");
const PORT = Number(process.argv[2] || 6902);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp",
  ".woff2": "font/woff2", ".mp4": "video/mp4", ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

/** Enrobe la réponse node:http à la façon Vercel (res.status().json()). */
function vercelRes(res) {
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (o) => { res.setHeader("Content-Type", "application/json; charset=utf-8"); res.end(JSON.stringify(o)); return res; };
  return res;
}
const readBody = (req) => new Promise((r) => { let s = ""; req.on("data", (c) => (s += c)); req.on("end", () => r(s)); });

const HANDLERS = {
  "/api/chat": "../api/chat.js",
  "/api/lead": "../api/lead.js",
  "/api/admin/content": "../api/admin/content.js",
  "/api/admin/leads": "../api/admin/leads.js",
};

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  let path = decodeURIComponent(url.pathname);

  const route = HANDLERS[path.replace(/\/$/, "")];
  if (route) {
    try {
      const mod = await import(new URL(route, import.meta.url).href);
      req.body = await readBody(req);
      console.log(`[api] ${req.method} ${path}`);
      await mod.default(req, vercelRes(res));
    } catch (e) {
      console.error("[api] ", e);
      vercelRes(res).status(500).json({ error: String(e.message || e) });
    }
    return;
  }

  if (path.endsWith("/")) path += "index.html";
  let file = join(ROOT, path);
  try {
    const st = await stat(file);
    if (st.isDirectory()) file = join(file, "index.html");
  } catch {
    try { await stat(file + "/index.html"); file = file + "/index.html"; }
    catch { file = join(ROOT, "404.html"); res.statusCode = 404; }
  }
  try {
    const buf = await readFile(file);
    res.setHeader("Content-Type", TYPES[extname(file)] || "application/octet-stream");
    res.end(buf);
  } catch {
    res.statusCode = 404; res.end("404");
  }
}).listen(PORT, () => console.log(`dist + api servis sur http://localhost:${PORT}`));
