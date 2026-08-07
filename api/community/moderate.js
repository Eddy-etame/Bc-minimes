/* POST /api/community/moderate — le staff approuve (on retague) ou refuse
   (on détruit). Staff uniquement. Rien ne devient public sans passer ici. */
import { allowCors, body, isAdmin } from "../_lib/util.js";
import { cloudinary, cloudReady, FOLDER, MAX_SEC, withTimeout, CLOUD_TIMEOUT_MS } from "../_lib/community.js";

export default async function handler(req, res) {
  allowCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
  if (!cloudReady()) return res.status(503).json({ error: "Cloudinary n’est pas configuré." });

  const { id, action, kind } = body(req);
  if (!id) return res.status(400).json({ error: "Missing id" });
  const resource_type = kind === "video" ? "video" : "image";
  try {
    if (action === "approve") {
      /* ⚠ LA DURÉE VIDÉO SE VÉRIFIE ICI, PAS SEULEMENT DANS LE NAVIGATEUR.
         Le dépôt part signé DIRECTEMENT chez Cloudinary : notre fonction
         n’a jamais vu les octets, donc un client bricolé peut déposer une
         vidéo de 30 s. On refuse de la faire monter sur le mur — on relit
         la durée RÉELLE mesurée par Cloudinary (pas celle déclarée par le
         client). En cas de panne de lecture, on NE bloque pas le staff
         (dégradation honnête) : le mur public filtre déjà toute vidéo trop
         longue, elle ne peut de toute façon pas s’afficher. */
      if (resource_type === "video") {
        try {
          const info = await withTimeout(
            cloudinary.search.expression(`folder:${FOLDER} AND public_id="${id}" AND resource_type:video`).max_results(1).execute(),
            CLOUD_TIMEOUT_MS, "moderate-duration");
          const dur = Number(info.resources?.[0]?.duration || 0);
          if (dur > MAX_SEC + 0.5)
            return res.status(400).json({ error: `Cette vidéo fait ${Math.round(dur)} s — le mur s’arrête à ${MAX_SEC} s. Refuse-la : elle ne peut pas monter.` });
        } catch { /* lecture indisponible : le mur public filtre déjà, on n’empêche pas le staff d’agir */ }
      }
      await cloudinary.uploader.add_tag("approved", [id], { resource_type });
      await cloudinary.uploader.remove_tag("pending", [id], { resource_type });
    } else if (action === "reject") {
      await cloudinary.uploader.destroy(id, { resource_type });
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }
    res.status(200).json({ ok: true, id, status: action === "approve" ? "approved" : "rejected" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
