/* =====================================================================
   POST /api/chat — l'assistant du Boxing Center Minimes.
   Ancré sur les VRAIES données de CETTE salle : le bloc INFOS est
   construit depuis src/content.json (le fichier que le backoffice
   publie), avec repli statique figé si la lecture échoue. Le bot ne
   sait rien d'autre : pas de prix inventé, pas d'horaire inventé.

   Cascade de fournisseurs : pool de clés Gemini (mélangées, on saute
   les mortes) → Groq → Mistral. AUCUNE clé configurée ? La fonction
   répond quand même, depuis la base de connaissance locale — la
   page ne meurt jamais, elle perd juste la conversation libre.
   ===================================================================== */
import { allowCors, body, siteContent } from "./_lib/util.js";

/* Faits que le backoffice ne touche pas : accès, équipement, réseau. */
const STATIC_TAIL = `- Accès : métro ligne B station Barrière de Paris, 3 minutes à pied. Rocade sortie 31 direction Les Minimes. Bus 70 / 27 arrêt Minimes-Roquelaine.
- La salle : 3 rings, 12 sacs lourds, zone pattes d'ours, zone prépa physique à l'étage, vestiaires hommes et femmes séparés. Affiliations FFBoxe, FFKMDA, FMMAF.
- L'histoire : ouverte en 2016, c'est la PREMIÈRE salle du groupe Boxing Center — la salle historique. Trois boxeurs professionnels en sont sortis : Johnson Suffo, Salomon Kitoko, Elyasse Azap.
- Séance d'essai : 10€, toutes disciplines, gants et protections prêtés, sans engagement et sans dossier. Réservation sur box-plus.vercel.app/seance-essai ou sur place.
- Accès libre : rings et sacs en autonomie tous les jours de 10h à 12h et de 13h20 à 18h (le mercredi jusqu'à 15h seulement, l'école prend la salle).
- Réseau Boxing Center : Portet-sur-Garonne (vaisseau amiral), États-Unis, Saint-Cyprien, Ramonville. L'abonnement saison ouvre l'accès libre aux 5 clubs. Groupe : boxingcenter.fr.`;

/* Repli si content.json est illisible : les mêmes faits, figés. */
const STATIC_INFO = `- Boxing Center Minimes : salle historique du groupe Boxing Center (depuis 2016), quartier des Minimes / Barrière de Paris. Spécialité maison : la boxe anglaise. « Le berceau des champions. »
- Adresse : 12 rue de Fenouillet, 31200 Toulouse. Téléphone : 05 62 24 46 82. Email : boxingcenter31@gmail.com.
- Horaires : du lundi au samedi, 10h00 – 21h30. Fermé le dimanche.
- Tarifs : séance d'essai 10€ ; offre Duo 29€ PAR PERSONNE pour 4 semaines illimitées à deux (au lieu de 44€) ; saison complète 259€ les 12 mois payable en 4× sans frais (au lieu de 400€) ; école dès 280€ l'année.
- Disciplines : boxe anglaise (loisirs et compétiteurs), boxe éducative dès 3 ans (Baby Boxe 3/6, enfants 7/11, ados 12/16), Boxing Lady 100 % féminin, Boxing camp, boxe pieds-poings, PAOS et pattes d'ours, cross training et cardio boxing en accès libre.
- Coachs : Mehdi B (coach principal, anglaise, école, compétiteurs, camp, sparring), Chloé (Boxing Lady du lundi), David (Boxing Lady du mercredi et pieds-poings), Hicham (Boxing camp mardi et jeudi).
- Planning : anglaise loisirs le midi 12h40 (mardi, mercredi, jeudi) et le soir 19h40 (lundi, mardi, jeudi, vendredi) ; compétiteurs 18h (lundi, mardi, jeudi, vendredi) ; Boxing Lady lundi et mercredi 18h30 ; Boxing camp lundi et vendredi 12h40, mardi et jeudi 18h30, samedi 11h ; pieds-poings mercredi 19h40 ; l'école mercredi et samedi après-midi ; open sparring samedi 18h30.`;

/** Le bloc d'infos construit depuis le contenu éditable du backoffice. */
export function liveInfo() {
  const c = siteContent();
  if (!c) return null;
  try {
    const s = c.salle || {};
    const a = s.address || {};
    const L = [];
    if (s.name)
      L.push(`${s.name} : salle historique du groupe Boxing Center (depuis 2016), quartier des Minimes / Barrière de Paris. Spécialité maison : la boxe anglaise. « ${s.baseline || "Le berceau des champions."} »`);
    if (a.street)
      L.push(`Adresse : ${a.street}, ${a.zip || ""} ${a.city || ""}. Téléphone : ${s.phone || ""}. Email : ${s.email || ""}.`.replace(/\s+/g, " "));
    if (s.hours) L.push(`Horaires : ${s.hours}. Fermé le dimanche.`);
    const cards = c.promos?.cards;
    if (Array.isArray(cards) && cards.length)
      L.push("Tarifs : " + cards.map((t) => `${t.name} — ${t.price}${t.unit ? " " + t.unit : ""} ${t.period || ""} (${t.feature || ""})`.replace(/\s+/g, " ").trim()).join(" ; ") + ".");
    const co = c.coaches || {};
    const names = [co.pillar?.name && `${co.pillar.name} (${co.pillar.role || "coach"})`]
      .concat((co.roster || []).map((m) => `${m.name} (${m.role || "coach"})`))
      .filter(Boolean);
    if (names.length) L.push("Coachs : " + names.join(", ") + ".");
    /* La note Google vient du vestiaire, jamais d'une constante figée :
       si le staff la vide, le bot n'en parle plus au lieu d'annoncer un
       chiffre que plus personne ne peut corriger. */
    const av = c.avis || {};
    const note = String(av.rating || "").trim(), nb = String(av.count || "").trim();
    if (note) L.push(`Avis Google : ${note} sur ${String(av.scale || "5").trim()}${nb ? ` (${nb} avis)` : ""}.`);
    if (Array.isArray(c.planning) && c.planning.length) {
      const byDay = {};
      for (const p of c.planning) (byDay[p.d] ||= []).push(`${p.h}${p.end ? "–" + p.end : ""} ${p.name}${p.coach ? " (" + p.coach + ")" : ""}`);
      L.push("Planning de la semaine : " + Object.entries(byDay).map(([d, v]) => `${d} ${v.join(" / ")}`).join(" ; ") + ".");
    }
    return L.length >= 4 ? "- " + L.join("\n- ") : null; // contenu trop partiel → repli
  } catch { return null; }
}

const SYSTEM_BASE = `Tu es l'assistant du BOXING CENTER MINIMES — la salle historique du groupe Boxing Center, à Toulouse (quartier des Minimes, Barrière de Paris).
Ton rôle : renseigner le visiteur, avec la voix d'un coach de la maison, et lui donner envie de pousser la porte.

RÈGLES :
- Réponds en FRANÇAIS, au TUTOIEMENT, en 2 à 4 phrases. Direct, chaleureux, jamais commercial ni corporate.
- Réponds UNIQUEMENT à partir des infos ci-dessous. Si une info précise manque, dis-le et invite à appeler le 05 62 24 46 82 ou à passer à la salle. N'invente JAMAIS un prix, un horaire, un nom de coach, un palmarès ou une date.
- L'offre Duo à 29€ s'écrit TOUJOURS « 29€ par personne » — jamais « 29€ » tout court.
- Comprends le langage naturel : fautes, phrases courtes, argot. Déduis l'intention.
- Si le visiteur donne son prénom, sers-t'en. S'il est chaud (essai, inscription, cours qui l'intéresse), propose-lui GENTIMENT de te laisser son prénom et un numéro ou un email pour qu'un coach le rappelle — une fois, sans insister, sans bloquer la conversation.
- Ne promets jamais un rappel à une heure précise, ni une place réservée : tu transmets, c'est tout.`;

function systemFor(context) {
  const info = liveInfo() || STATIC_INFO;
  const base = `${SYSTEM_BASE}\n\nINFOS SALLE (Minimes) :\n${info}\n${STATIC_TAIL}`;
  const c = String(context || "").slice(0, 300).trim();
  return c ? `${base}\n\nCONTEXTE VISITEUR (déjà connu, ne le redemande pas) : ${c}` : base;
}

/* ---------- fournisseurs ---------- */
async function gemini(key, model, messages, system) {
  const contents = messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system_instruction: { parts: [{ text: system }] }, contents, generationConfig: { maxOutputTokens: 400, temperature: 0.4 } }),
  });
  if (!r.ok) throw new Error("gemini " + r.status);
  const j = await r.json();
  const text = j?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("").trim();
  if (!text) throw new Error("gemini empty");
  return text;
}
async function openaiLike(url, key, model, messages, system) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, max_tokens: 400, temperature: 0.4, messages: [{ role: "system", content: system }, ...messages] }),
  });
  if (!r.ok) throw new Error("oai " + r.status);
  const j = await r.json();
  const text = (j?.choices?.[0]?.message?.content || "").trim();
  if (!text) throw new Error("oai empty");
  return text;
}

/* ---------- la base locale : le bot reste utile SANS aucune clé ----------
   Mêmes faits que le prompt, mais servis par mots-clés. C'est le filet
   qui empêche « assistant indisponible » — un faux, exactement comme la
   pastille tel: qu'on vient de remplacer. */
export const KB = [
  /* Le planning AVANT l'adresse : « envoie-moi le planning » contient
     « plan », et tombait sur la réponse « voici l'adresse ». Défaut vu
     sur le rendu, pas deviné. */
  { re: /planning|cr[ée]neau|horaire des cours|quand.*(?:cours|entra[îi])/i,
    a: "Le planning tourne du lundi au samedi : anglaise loisirs le midi à 12h40 et le soir à 19h40, compétiteurs à 18h, Boxing Lady lundi et mercredi 18h30, Boxing camp midi et soir, l'école le mercredi et le samedi après-midi, open sparring le samedi 18h30. Le détail complet est sur la page Planning." },
  { re: /essai|d[ée]couvr|tester|premi[èe]re fois|premiere fois|gratuit|venir voir/i,
    a: "La séance d'essai est à 10€ : la discipline que tu veux, gants et protections prêtés, aucun dossier à monter. Tu viens, tu boxes, tu décides après. Réservation sur box-plus.vercel.app/seance-essai ou directement à la salle." },
  { re: /tarif|prix|co[ûu]te|combien|abonn|mensuel|saison|duo|259|29|280/i,
    a: "Essai 10€. Duo : 29€ PAR PERSONNE pour 4 semaines illimitées à deux (au lieu de 44€). Saison complète : 259€ les 12 mois au lieu de 400€, payable en 4× sans frais, avec l'accès libre aux 5 clubs du réseau. L'école, dès 280€ l'année. Tout est détaillé sur la page Tarifs." },
  { re: /horaire|ouvert|ferm|heure|dimanche|acc[èe]s libre/i,
    a: "La salle est ouverte du lundi au samedi, de 10h00 à 21h30. Fermé le dimanche. En dehors des cours, les rings et les sacs sont à toi en accès libre : 10h–12h et 13h20–18h (le mercredi ça s'arrête à 15h, l'école prend la salle)." },
  /* « où » accentué est sans ambiguïté ; « ou » nu ne compte que collé à
     un repère de lieu, sinon « anglaise ou MMA ? » réclamerait l'adresse. */
  { re: /adresse|\boù\b|(?:c['’]est|vous [êe]tes|se trouve|situ[ée]e?)\s*o[ùu]|o[ùu]\s*(?:est|se|vous|[êe]tes)|situ[ée]e?\b|acc[èe]s|m[ée]tro|parking|comment venir|\bplan\b|\brue\b|barri[èe]re/i,
    a: "12 rue de Fenouillet, 31200 Toulouse — quartier des Minimes, Barrière de Paris. Métro ligne B, station Barrière de Paris, 3 minutes à pied. Rocade sortie 31, ou bus 70 / 27 arrêt Minimes-Roquelaine." },
  { re: /enfant|gamin|fils|fille|baby|[ée]ducative|ado|3 ans|7 ans|\b(?:mon|ma) (?:gosse|petit)/i,
    a: "L'école commence dès 3 ans : Baby Boxe 3/6 ans le samedi à 14h15, enfants 7/11 à 15h, ados 12/16 à 16h, jeunes compétiteurs à 17h — le mercredi et le samedi. C'est Mehdi B qui les tient, du premier gant jusqu'au ring. À partir de 280€ l'année." },
  { re: /femme|lady|f[ée]minin|entre filles/i,
    a: "Le Boxing Lady est 100 % féminin : lundi 18h30 avec Chloé, mercredi 18h30 avec David, une heure pleine. Le lundi, le second espace de la salle est rien que pour elles. Et tous les autres cours te sont ouverts." },
  { re: /discipline|cours|anglaise|pieds.?poings|camp|sparring|cardio|cross|paos|comp[ée]tit|mma|kick/i,
    a: "La spécialité maison, c'est la boxe anglaise : loisirs le midi et le soir, compétiteurs à 18h quatre soirs par semaine, open sparring le samedi 18h30. À côté : Boxing Lady, Boxing camp, pieds-poings le mercredi, l'école dès 3 ans, plus le cross training et le cardio boxing en accès libre." },
  { re: /coach|entra[îi]neur|prof|encadr|[ée]quipe|mehdi|chlo|david|hicham/i,
    a: "Mehdi B tient la maison : anglaise, école, compétiteurs, boxing camp, sparring — presque tous les créneaux de la semaine. Chloé mène le Boxing Lady du lundi, David celui du mercredi puis les pieds-poings, et Hicham le boxing camp du mardi et du jeudi." },
  { re: /d[ée]butant|jamais box|niveau|peur|forme|condition/i,
    a: "Tu ne seras ni le premier ni le seul à arriver sans avoir jamais mis un gant. Le coach te met en garde, te corrige, recommence — dix fois s'il le faut. Et si tu ne veux rien encaisser au début, le cardio boxing te donne tout le geste sans le moindre coup reçu." },
  { re: /salle|ring|sac|mat[ée]riel|[ée]quipement|vestiaire|[ée]tage|histoire|champion|pro\b/i,
    a: "Trois rings, douze sacs lourds, une zone pattes d'ours et la prépa physique à l'étage, au-dessus des rings. Vestiaires hommes et femmes séparés. C'est la première salle du groupe, ouverte en 2016 — trois pros en sont sortis : Johnson Suffo, Salomon Kitoko, Elyasse Azap." },
  { re: /contact|t[ée]l[ée]phone|email|mail|num[ée]ro|appeler|joindre/i,
    a: "Téléphone : 05 62 24 46 82. Email : boxingcenter31@gmail.com. Ou passe simplement à la salle, 12 rue de Fenouillet, du lundi au samedi entre 10h et 21h30." },
  { re: /inscri|adh[ée]r|certificat|m[ée]dical|dossier|papier/i,
    a: "Pour l'essai à 10€, tu n'as rien à apporter — ni dossier, ni certificat. C'est au moment de t'inscrire pour de bon qu'on te demande le certificat médical et de quoi régler. Le coach te déroule tout ça sur place." },
  { re: /r[ée]seau|autre salle|portet|cyprien|ramonville|[ée]tats.?unis|groupe/i,
    a: "Boxing Center, c'est cinq clubs à Toulouse et autour : Minimes (ici, la salle historique), Portet-sur-Garonne, États-Unis, Saint-Cyprien et Ramonville. La saison ouvre l'accès libre à tous. Le site du réseau : boxingcenter.fr." },
];
/* Salutation / présentation : sans clé d'IA, le visiteur qui dit
   « moi c'est Karim » tombait sur le catalogue générique. Le contexte
   porte déjà le prénom capté par le widget — on s'en sert. */
const HELLO_RE = /^\s*(?:bonjour|salut|coucou|hello|hey|yo|bonsoir|[çc]a va)|je m['’ ]?appelle|moi c['’ ]?est|mon (?:nom|pr[ée]nom)/i;
const prenomOf = (context) => (String(context || "").match(/Pr[ée]nom\s*:\s*([^.]+)/i)?.[1] || "").trim();

/* Un message qui n'est QUE des coordonnées (« sofia.b@example.com »)
   ne mérite pas le catalogue des rubriques : il mérite un accusé de
   réception. Défaut relevé sur le rendu. */
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_RE = /(?:\+33|0)\s?[1-9](?:[\s.-]?\d{2}){4}/;
function onlyContact(msg) {
  if (!EMAIL_RE.test(msg) && !PHONE_RE.test(msg)) return false;
  const rest = msg.replace(EMAIL_RE, " ").replace(PHONE_RE, " ").replace(/[^a-zà-öø-ÿ]/gi, " ").trim();
  return rest.split(/\s+/).filter(Boolean).length <= 2;
}

export function localAnswer(msg, context = "") {
  const p = prenomOf(context);
  if (onlyContact(msg))
    return `Parfait${p ? ", " + p : ""} — je garde ça pour le coach. En attendant, une question ? Horaires, tarifs, un cours en particulier : je suis là pour ça.`;
  if (HELLO_RE.test(msg))
    return `${p ? `Enchanté ${p} !` : "Salut !"} Dis-moi ce que tu cherches : les horaires, les tarifs, les cours, l'école dès 3 ans, le Boxing Lady, ou la séance d'essai à 10€. Je te réponds.`;
  for (const k of KB) if (k.re.test(msg)) return k.a;
  return `${p ? p + ", je" : "Je"} peux te renseigner sur les horaires, les tarifs, les cours, l'école dès 3 ans, le Boxing Lady ou la séance d'essai à 10€. Pose ta question — ou appelle la salle au 05 62 24 46 82.`;
}

export default async function handler(req, res) {
  allowCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const b = body(req);
  const message = String(b.message || "").slice(0, 500).trim();
  if (!message) return res.status(400).json({ error: "Message vide." });
  const history = Array.isArray(b.history)
    ? b.history.slice(-6).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content || "").slice(0, 500) }))
    : [];
  const messages = [...history, { role: "user", content: message }];
  const system = systemFor(b.context);

  // 1) pool de clés Gemini (mélangé, on saute les mortes)
  const gKeys = Object.keys(process.env).filter((k) => /^GEMINI_API_KEY/.test(k)).map((k) => process.env[k]).filter(Boolean);
  for (let i = gKeys.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [gKeys[i], gKeys[j]] = [gKeys[j], gKeys[i]]; }
  const gModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  for (const key of gKeys) {
    try { return res.status(200).json({ reply: await gemini(key, gModel, messages, system), via: "gemini" }); } catch { /* clé suivante */ }
  }
  // 2) Groq — 3) Mistral
  if (process.env.GROQ_API_KEY) {
    try { return res.status(200).json({ reply: await openaiLike("https://api.groq.com/openai/v1/chat/completions", process.env.GROQ_API_KEY, process.env.GROQ_MODEL || "llama-3.3-70b-versatile", messages, system), via: "groq" }); } catch {}
  }
  if (process.env.MISTRAL_API_KEY) {
    try { return res.status(200).json({ reply: await openaiLike("https://api.mistral.ai/v1/chat/completions", process.env.MISTRAL_API_KEY, process.env.MISTRAL_MODEL || "mistral-small-latest", messages, system), via: "mistral" }); } catch {}
  }
  // 4) aucune clé, ou toutes en panne : la base locale répond quand même.
  return res.status(200).json({ reply: localAnswer(message, b.context), via: "local" });
}
