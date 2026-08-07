/* =====================================================================
   GET /api/admin/leads — le carnet de contacts, pour le backoffice.
   Lit la liste écrite par /api/lead dans le KV. Si aucun KV n’est
   configuré, on répond 200 avec une liste vide ET la raison : le
   vestiaire affiche alors un encart qui explique quoi brancher, au
   lieu d’un tableau vide qui laisse croire que personne n’a écrit.
   ===================================================================== */
import { allowCors, isAdmin, kv, kvReady, KV_KEY } from "../_lib/util.js";

export default async function handler(req, res) {
  allowCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (!isAdmin(req))
    return res.status(401).json({ error: process.env.ADMIN_TOKEN ? "Unauthorized" : "ADMIN_TOKEN non configuré." });
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  if (!kvReady())
    return res.status(200).json({
      leads: [], storage: false,
      /* Le backoffice met déjà « Aucun stockage branché » en gras devant :
         cette phrase enchaîne, elle ne le répète pas. */
      why: "Ajoute KV_REST_API_URL et KV_REST_API_TOKEN (Vercel KV ou Upstash) dans les variables du projet, puis redéploie. En attendant, les contacts partent par email si RESEND_API_KEY est configuré, et ils restent visibles dans les logs Vercel.",
    });

  try {
    const raw = (await kv(["LRANGE", KV_KEY, "0", "499"])) || [];
    const leads = raw.map((s) => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);
    return res.status(200).json({ leads, storage: true });
  } catch (e) {
    return res.status(502).json({ error: "Lecture du carnet impossible (" + e.message + ")" });
  }
}
