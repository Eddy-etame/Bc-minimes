/* GET /api/community/items — le mur public : les médias APPROUVÉS, rien d'autre.
   Si Cloudinary n'est pas branché, on renvoie une liste vide : la page
   affiche son état d'attente et ne casse jamais. */
import { allowCors } from "../_lib/util.js";
import { cloudReady, searchByTag, MAX_MB, MAX_SEC } from "../_lib/community.js";

export default async function handler(req, res) {
  allowCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  const limits = { maxMb: MAX_MB, maxSec: MAX_SEC };
  if (!cloudReady()) return res.status(200).json({ items: [], ready: false, limits });
  try {
    res.status(200).json({ items: await searchByTag("approved", "desc"), ready: true, limits });
  } catch {
    res.status(200).json({ items: [], ready: true, limits });
  }
}
