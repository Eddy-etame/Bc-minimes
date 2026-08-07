/* POST /api/community/verify
   L'œil de la machine, avant que le fichier ne parte chez Cloudinary.

   Le navigateur envoie ici une VIGNETTE de la photo (redimensionnée à
   ~640 px, en JPEG) — pas le fichier d’origine. Trois raisons, dans
   l’ordre d’importance :
     1. une fonction Vercel plafonne à 4,5 Mo de corps de requête ;
     2. le modèle n’a pas besoin de 12 mégapixels pour voir un ring ;
     3. le visiteur n’attend pas le téléversement de son fichier complet
        pour apprendre qu’il est refusé.

   Seules les PHOTOS passent par ici. Une vidéo va directement en file de
   modération humaine : on ne prétend pas analyser des images animées
   avec un outil qui regarde des images fixes.

   SANS CLÉ GEMINI, cette route répond "pass" et le dit (`via: "no-key"`).
   Elle ne bloque rien, jamais. */
import { allowCors, body } from "../_lib/util.js";
import { checkImage } from "../_lib/vision.js";

/* La vignette fait quelques dizaines de Ko. Au-delà de 3 Mo de base64,
   ce n’est plus une vignette : c’est quelqu’un qui pousse. */
const MAX_B64 = 3 * 1024 * 1024;

export default async function handler(req, res) {
  allowCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const b = body(req);
  const raw = String(b.image || "");
  /* On accepte la forme data:image/jpeg;base64,XXXX comme la forme nue. */
  const m = raw.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
  const mime = m ? m[1] : String(b.mime || "image/jpeg");
  const base64 = m ? m[2] : raw;

  if (!base64 || base64.length > MAX_B64 || !/^[A-Za-z0-9+/=\s]+$/.test(base64.slice(0, 256)))
    return res.status(400).json({ error: "Image illisible." });

  let out;
  try {
    out = await checkImage(base64.replace(/\s/g, ""), mime);
  } catch {
    /* Un plantage ici ne doit pas coûter son dépôt au visiteur. */
    out = { verdict: "pass", via: "unavailable" };
  }

  if (out.verdict === "reject")
    return res.status(200).json({
      ok: false,
      via: out.via,
      /* voix de coach, jamais un code : on dit ce qui ne va pas et ce
         qu’on attend à la place. */
      error: "Cette photo n’a rien à faire sur le mur du club. Envoie-nous la salle, le ring, les gants, les gens qui bossent.",
    });

  return res.status(200).json({ ok: true, via: out.via });
}
