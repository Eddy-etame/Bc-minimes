/* POST /api/community/moderate — le staff approuve (on retague) ou refuse
   (on détruit). Staff uniquement. Rien ne devient public sans passer ici. */
import { allowCors, body, isAdmin } from "../_lib/util.js";
import { cloudinary, cloudReady } from "../_lib/community.js";

export default async function handler(req, res) {
  allowCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
  if (!cloudReady()) return res.status(503).json({ error: "Cloudinary n'est pas configuré." });

  const { id, action, kind } = body(req);
  if (!id) return res.status(400).json({ error: "Missing id" });
  const resource_type = kind === "video" ? "video" : "image";
  try {
    if (action === "approve") {
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
