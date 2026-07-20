/* GET /api/community/pending — la file de modération. Staff uniquement. */
import { allowCors, isAdmin } from "../_lib/util.js";
import { cloudReady, searchByTag } from "../_lib/community.js";

export default async function handler(req, res) {
  allowCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
  if (!cloudReady())
    return res.status(200).json({ items: [], ready: false, why: "Ajoute CLOUDINARY_URL dans les variables du projet Vercel, puis redéploie. Sans elle, le mur du club reste fermé." });
  try {
    res.status(200).json({ items: await searchByTag("pending", "asc"), ready: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
