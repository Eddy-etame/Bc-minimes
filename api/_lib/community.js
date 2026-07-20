/* =====================================================================
   LA GALERIE DU CLUB — socle Cloudinary (identique à Portet).

   Cloudinary est à la fois le STOCKAGE, le TRANSCODAGE (transformations à
   la livraison), la BASE (les tags portent l'état) et la MODÉRATION.
   Tout est lu depuis CLOUDINARY_URL — une seule variable, rien d'autre.

   Chaque salle a son PROPRE dossier : les murs ne se mélangent jamais.
   Ici : "bc-minimes-community".

   L'ÉTAT VIT DANS LES TAGS :
     pending  → déposé, invisible du public, en attente du staff
     approved → validé dans Le coin bleu, visible sur /galerie/
   Rien d'autre n'est publié. Jamais.
   ===================================================================== */
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({ secure: true }); // lit CLOUDINARY_URL dans l'environnement

export { cloudinary };
export const FOLDER = process.env.CLOUDINARY_FOLDER || "bc-minimes-community";

/** Le mur est-il branché ? Sans CLOUDINARY_URL, tout dégrade proprement. */
export const cloudReady = () => Boolean(cloudinary.config().api_key && cloudinary.config().api_secret);

/* Modération automatique : uniquement si l'add-on est configuré
   (CLOUDINARY_MODERATION = "aws_rek" | "google_video_moderation" | …).
   SANS elle, le système marche exactement pareil — tout part en file de
   modération humaine. C'est la dégradation honnête : on ne promet pas
   une vérification qu'on n'a pas. */
export const MODERATION = process.env.CLOUDINARY_MODERATION || "";

export const MAX_MB = +(process.env.COMMUNITY_MAX_MB || 60);
export const MAX_SEC = +(process.env.COMMUNITY_MAX_SEC || 15);

/* ⚠ TOUT APPEL À CLOUDINARY EST BORNÉ DANS LE TEMPS.
   Le SDK n'expose pas de signal d'annulation : un compte injoignable, une
   panne côté Cloudinary ou une clé invalide laissaient la recherche
   pendante — mesuré à 5,6 s sur /api/community/items, et INFINI sur
   /api/community/sign, où le visiteur restait bloqué sur « Préparation… »
   avec son fichier dans les mains. Le commentaire disait « au pire on
   laisse passer » ; sans horloge, ça ne laissait rien passer du tout.
   Une promesse qui n'aboutit pas doit ÉCHOUER, pas attendre. */
export function withTimeout(promise, ms, label = "cloudinary") {
  let t;
  return Promise.race([
    promise.finally(() => clearTimeout(t)),
    new Promise((_, rej) => { t = setTimeout(() => rej(new Error(`${label}-timeout`)), ms); }),
  ]);
}
export const CLOUD_TIMEOUT_MS = +(process.env.CLOUDINARY_TIMEOUT_MS || 4000);

/** Cloudinary → la forme d'objet que le site attend. Image ET vidéo. */
export function publicItem(r) {
  const id = r.public_id;
  const kind = r.resource_type === "video" ? "video" : "image";
  const ctx = (r.context && (r.context.custom || r.context)) || {};
  const src =
    kind === "video"
      ? cloudinary.url(id, { resource_type: "video", secure: true, transformation: [{ quality: "auto" }] })
      : cloudinary.url(id, { secure: true, transformation: [{ quality: "auto", fetch_format: "auto", width: 1400, crop: "limit" }] });
  /* l'affiche : une image dans les deux cas — c'est elle qu'on charge en
     premier, jamais la vidéo (cf. le chargement paresseux côté client) */
  const poster =
    kind === "video"
      ? cloudinary.url(id, { resource_type: "video", format: "jpg", secure: true, transformation: [{ quality: "auto", width: 800, crop: "limit" }] })
      : cloudinary.url(id, { secure: true, transformation: [{ quality: "auto", fetch_format: "auto", width: 800, crop: "limit" }] });
  return { id, kind, title: ctx.title || "", author: ctx.author || "", src, poster, createdAt: r.created_at };
}

/** Cherche dans le dossier de la salle, images ET vidéos, par tag.
 *  ⚠ Les deux recherches partent EN PARALLÈLE. En série, chacune ajoutait
 *  sa latence à l'autre : mesuré 6,3 s pour /api/community/items, et
 *  jusqu'à 8 s dans le pire cas (deux fois le délai de garde) alors que
 *  les deux appels sont totalement indépendants. En parallèle, le pire
 *  cas est celui d'UN appel. */
export async function searchByTag(tag, order = "desc") {
  const one = async (resource_type) => {
    try {
      const r = await withTimeout(
        cloudinary.search
          .expression(`folder:${FOLDER} AND resource_type:${resource_type} AND tags=${tag}`)
          .with_field("context")
          .sort_by("created_at", order)
          .max_results(60)
          .execute(),
        CLOUD_TIMEOUT_MS, `search-${resource_type}`);
      return (r.resources || []).map(publicItem);
    } catch { return []; /* un type absent, ou une panne : ni l'un ni l'autre n'est une erreur ici */ }
  };
  const out = (await Promise.all([one("image"), one("video")])).flat();
  out.sort((a, b) => (order === "desc" ? String(b.createdAt).localeCompare(String(a.createdAt)) : String(a.createdAt).localeCompare(String(b.createdAt))));
  return out;
}
