/* =====================================================================
   L'ŒIL — vérification du contenu d’une PHOTO déposée, par Gemini.

   Le navigateur a déjà fait le travail mécanique : signature d’octets,
   décodage réel, durée de la vidéo. Tout ça dit « c’est bien une image ».
   Ça ne dit RIEN de ce qu’il y a dessus. C’est ici qu’on regarde.

   Ce que l'œil tranche, et RIEN d’autre :
     reject → manifestement hors sujet, ou inapproprié (nu, violence
              gratuite, capture d’écran, mème, document, publicité)
     pass   → une vraie photo, plausiblement liée à une salle de sport,
              de boxe, de combat, ou aux gens qui s’y entraînent
   Dans le doute, on PASSE. L'œil écarte l’évident, il n’arbitre pas.
   Un humain tranche derrière, toujours : rien n’est publié d’ici.

   ⚠ LA RÈGLE DE DÉGRADATION : sans clé, avec une clé morte, sur panne
   ou sur lenteur, cette fonction renvoie { verdict: "pass", via: ... }.
   Le dépôt part alors en file de modération humaine — exactement comme
   avant. On ne bloque JAMAIS un visiteur parce qu’un secret manque :
   une vérification qu’on n’a pas ne doit pas se transformer en porte
   fermée. C’est la même loi que pour l’assistant.
   ===================================================================== */

/** Le pool de clés, comme pour l’assistant : GEMINI_API_KEY, _2, _3…
 *  Mélangé à chaque appel pour répartir le quota, et on saute les mortes. */
export function geminiKeys() {
  const keys = Object.keys(process.env)
    .filter((k) => /^GEMINI_API_KEY/.test(k))
    .map((k) => process.env[k])
    .filter(Boolean);
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  return keys;
}

export const visionReady = () => geminiKeys().length > 0;

const MODEL = process.env.GEMINI_VISION_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash";
const TIMEOUT_MS = +(process.env.VISION_TIMEOUT_MS || 8000);
/* Le nombre de clés essayées, et le temps TOTAL accordé à l'œil. Passé
   ce délai, le dépôt part en file humaine — on ne fait pas poireauter
   quelqu’un qui a un fichier dans les mains. */
const MAX_TRIES = +(process.env.VISION_MAX_TRIES || 2);
const MAX_TOTAL_MS = +(process.env.VISION_TOTAL_MS || 12000);

/* La consigne. Elle est étroite EXPRÈS : plus la question est large, plus
   le modèle invente. On lui demande un mot, pas un avis. */
const PROMPT = `Tu filtres les photos déposées par les visiteurs d’un club de boxe (Boxing Center, Toulouse Minimes).
Regarde cette image et réponds par UN SEUL MOT, rien d’autre :

REJET  — si c’est manifestement inapproprié (nudité, sexe, violence gratuite, haine, drogue),
         OU si ce n’est visiblement pas une photo (capture d’écran, mème, document scanné,
         affiche publicitaire, texte plein cadre, dessin généré),
         OU si c’est manifestement sans aucun rapport avec un club de sport ou de combat.
OK     — dans TOUS les autres cas : salle, ring, sacs, gants, entraînement, combat, groupe,
         coachs, adhérents, matériel, vestiaire, extérieur du club, portraits de pratiquants.

Dans le doute, réponds OK. Tu écartes l’évident, tu ne juges pas la qualité.`;

/** Un appel, une clé, borné dans le temps. Renvoie "REJET" | "OK" | null. */
async function askOne(key, base64, mime) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctl.signal,
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: PROMPT }, { inline_data: { mime_type: mime, data: base64 } }] }],
          generationConfig: {
            temperature: 0,
            /* ⚠ thinkingBudget: 0 N’EST PAS UNE OPTIMISATION.
               gemini-2.5-flash « réfléchit » par défaut, et ses jetons de
               pensée SE PAYENT sur maxOutputTokens. Mesuré ici : avec 8
               jetons, la réponse revenait vide, finishReason MAX_TOKENS,
               thoughtsTokenCount 4 — le modèle n’avait pas dit un mot.
               Résultat : CHAQUE photo repartait « sans avis », et l'œil
               de la machine était un décor. On coupe la réflexion (un
               mot ne s’analyse pas) et on laisse de la marge. */
            thinkingConfig: { thinkingBudget: 0 },
            maxOutputTokens: 16,
          },
          safetySettings: [
            /* On veut que le modèle NOUS DISE que c’est inapproprié, pas
               qu’il refuse de répondre : un refus silencieux nous ferait
               passer un contenu que l’on voulait justement écarter. */
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          ],
        }),
      }
    );
    if (!r.ok) throw new Error("gemini " + r.status);
    const j = await r.json();

    /* Si Gemini a bloqué la réponse pour cause de sécurité, c’est un
       signal en soi : l’image a déclenché ses propres filtres. */
    const blocked = j?.promptFeedback?.blockReason || j?.candidates?.[0]?.finishReason === "SAFETY";
    if (blocked) return "REJET";

    const txt = (j?.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join(" ").trim().toUpperCase();
    if (!txt) return null;                       // réponse vide = pas d’avis
    if (/\bREJET\b|\bREJECT\b/.test(txt)) return "REJET";
    if (/\bOK\b/.test(txt)) return "OK";
    return null;                                 // hors format : on n’invente pas
  } finally {
    clearTimeout(t);
  }
}

/**
 * Vérifie une photo. `base64` = l’image, sans le préfixe data:.
 * Renvoie { verdict: "pass" | "reject", via: "gemini" | "no-key" | "unavailable" }.
 *
 * `via` n’est PAS décoratif : c’est ce qui permet au staff de savoir si
 * un dépôt a réellement été regardé par la machine ou s’il arrive brut.
 */
export async function checkImage(base64, mime = "image/jpeg") {
  const keys = geminiKeys();
  if (!keys.length) return { verdict: "pass", via: "no-key" };

  /* ⚠ ON BORNE LE TOTAL, PAS SEULEMENT CHAQUE ESSAI.
     Le pool compte onze clés ici. À 8 s de garde chacune, une mauvaise
     journée chez Google faisait attendre le visiteur QUATRE-VINGT-HUIT
     SECONDES devant « On regarde ce qu’il y a sur la photo… » — mesuré :
     l’envoi restait bloqué au-delà de 45 s. Un délai par appel ne borne
     rien du tout quand on boucle.
     Deux clés suffisent à distinguer « cette clé est morte » de « le
     service est en panne » ; au-delà, on ne cherche plus, on passe la
     main à l’humain. L'œil fait gagner du temps au staff — il n’a pas le
     droit d’en coûter au visiteur. */
  const deadline = Date.now() + MAX_TOTAL_MS;
  for (const key of keys.slice(0, MAX_TRIES)) {
    if (Date.now() > deadline) break;
    try {
      const answer = await askOne(key, base64, mime);
      if (answer === "REJET") return { verdict: "reject", via: "gemini" };
      if (answer === "OK") return { verdict: "pass", via: "gemini" };
      /* null = le modèle n’a pas tranché : on ne réessaie pas avec une
         autre clé, ce n’est pas un problème de clé. On passe la main
         à l’humain. */
      return { verdict: "pass", via: "gemini-nc" };
    } catch {
      /* clé morte, quota, panne, lenteur → la clé suivante */
    }
  }
  return { verdict: "pass", via: "unavailable" };
}
