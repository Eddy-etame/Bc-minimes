/* POST /api/community/sign
   Valide (prénom, contact, titre, injures), limite par IP, puis renvoie des
   paramètres SIGNÉS pour que le navigateur téléverse le fichier DIRECTEMENT
   sur Cloudinary — les octets ne traversent jamais la fonction Vercel
   (limite de 4,5 Mo sur le corps d'une requête).

   Le dépôt atterrit tagué "pending" : invisible du public tant que le staff
   ne l'a pas approuvé depuis Le coin bleu. */
import { allowCors, body, ipOf, cleanName } from "../_lib/util.js";
import { cloudinary, cloudReady, FOLDER, MODERATION, withTimeout, CLOUD_TIMEOUT_MS } from "../_lib/community.js";

export default async function handler(req, res) {
  allowCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!cloudReady())
    return res.status(503).json({ error: "Le mur du club n'est pas encore ouvert. Reviens très vite." });

  const b = body(req);

  /* --- le prénom : obligatoire (c'est une signature, pas un anonymat) --- */
  const a = cleanName(b.author, 40);
  if (a.value.length < 2) return res.status(400).json({ error: "Donne ton prénom — on veut savoir qui a filmé." });
  if (a.bad) return res.status(400).json({ error: "Ce prénom ne passe pas. Mets le vrai." });

  /* --- le contact : email OU téléphone, au moins un --- */
  const email = String(b.email || "").trim().slice(0, 120);
  const phone = String(b.phone || "").trim().slice(0, 30);
  const emailOk = /^[^@\s]+@[^@\s.]+\.[a-z]{2,}$/i.test(email);
  const phoneOk = /^(?:\+33|0)\s?[1-9](?:[\s.\-]?\d{2}){4}$/.test(phone);
  if (!emailOk && !phoneOk)
    return res.status(400).json({ error: "Laisse un email ou un numéro — sinon on ne peut pas te prévenir quand ça passe en ligne." });

  /* --- le titre : facultatif, mais filtré s'il est là --- */
  const t = cleanName(b.title, 60);
  if (t.bad) return res.status(400).json({ error: "Ce titre ne passe pas. Trouve autre chose." });

  /* --- le type annoncé --- */
  const kind = b.kind === "video" ? "video" : "image";

  /* --- la limite par IP : trois dépôts par fenêtre, pas trente --- */
  const ip = ipOf(req);
  const windowMin = +(process.env.RATE_WINDOW_MIN || 10);
  const max = +(process.env.RATE_MAX || 3);
  try {
    const since = new Date(Date.now() - windowMin * 60000).toISOString();
    const r = await withTimeout(
      cloudinary.search
        .expression(`folder:${FOLDER} AND context.ip="${ip}" AND uploaded_at>"${since}"`)
        .max_results(max + 1)
        .execute(),
      CLOUD_TIMEOUT_MS, "rate-limit");
    if ((r.total_count ?? (r.resources || []).length) >= max)
      return res.status(429).json({ error: `Doucement — ${max} envois d'affilée, ça suffit. Reviens dans ${windowMin} minutes.` });
  } catch { /* panne ou lenteur : on laisse passer POUR DE VRAI (cf. withTimeout).
               Le dépôt part quand même en file de modération — aucun risque. */ }

  const timestamp = Math.round(Date.now() / 1000);
  /* le contact NE VA PAS dans le contexte Cloudinary : il vit dans le
     carnet du club (/api/lead), pas sur un média public. */
  const context = `title=${t.value}|author=${a.value}|ip=${ip}|kind=${kind}`;
  const paramsToSign = { context, folder: FOLDER, tags: "pending", timestamp };
  if (MODERATION) paramsToSign.moderation = MODERATION;
  const signature = cloudinary.utils.api_sign_request(paramsToSign, cloudinary.config().api_secret);

  res.status(200).json({
    cloudName: cloudinary.config().cloud_name,
    apiKey: cloudinary.config().api_key,
    timestamp, folder: FOLDER, tags: "pending", context, signature, kind,
    moderation: MODERATION || undefined,
  });
}
