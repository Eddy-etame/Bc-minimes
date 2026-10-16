/* =====================================================================
   MINIMES · src/semaine.mjs — la semaine de la salle, lue dans les données

   POURQUOI CE FICHIER. Trois pages gagnent le 13/10/2026 une section qui
   parle d'heures, de jours et de coachs : /le-club/ (la salle heure par
   heure), /coachs/ (qui t'encadre selon ce que tu viens chercher) et
   /galerie/ (quand venir voir ces scènes en vrai). Aucune de ces valeurs
   n'est tapée dans les pages : elles sont DÉRIVÉES ici, au build, du
   planning publié. Le planning change depuis le vestiaire (src/content.json,
   commité par /api/admin/content) : les trois sections suivent toutes
   seules, sans qu'un développeur repasse. Une ligne dont le fait disparaît
   du planning disparaît de la page — elle ne ment pas.

   ⚠ RÈGLE DU 19/08/2026 (brad, b1ef9b9) : le nom d'un coach n'est plus
   associé à une heure nulle part. Ce module donne les coachs d'une
   DISCIPLINE (coachsDe), jamais ceux d'un créneau. Les pages qui
   l'utilisent ne mettent jamais un prénom à côté d'une heure.
   ===================================================================== */
import content from "./content.json";
import { SALLE as SALLE_SOURCE } from "../public/assets/js/data.js";
import { PLANNING as PLANNING_SOURCE, PLANNING_DAYS } from "../public/assets/js/data-planning.js";
import { DISCIPLINES } from "../public/assets/js/data-disciplines.js";
import { SPECS } from "../public/assets/js/data-club.js";

/* Ce que le visiteur voit après la fusion de data.js (bcRegister) : un
   planning publié non vide remplace celui de la source, en entier. */
export const PLANNING = Array.isArray(content.planning) && content.planning.length ? content.planning : PLANNING_SOURCE;
export const SALLE = { ...SALLE_SOURCE, ...(content.salle || {}) };
export const JOURS = PLANNING_DAYS;

export const minutes = (h) => {
  const m = /^(\d{1,2})h(\d{2})?$/.exec(String(h || "").trim());
  return m ? Number(m[1]) * 60 + Number(m[2] || 0) : NaN;
};
/** "18h00" → "18h", "12h40" → "12h40". */
export const heure = (h) => String(h || "").replace(/h00$/, "h");

const NOMBRES = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize"];
const DIZAINES = { 20: "vingt", 30: "trente", 40: "quarante", 45: "quarante-cinq", 50: "cinquante", 60: "soixante", 90: "quatre-vingt-dix" };
/** 7 → "sept", 40 → "quarante" ; sinon le chiffre. */
export const enLettres = (n) => NOMBRES[n] ?? DIZAINES[n] ?? String(n);

/** ["a"] → "a" ; ["a", "b", "c"] → "a, b et c" (ou « a, b ou c »). */
export function listeFr(xs, lien = "et") {
  const l = xs.filter(Boolean);
  if (l.length < 2) return l.join("");
  return `${l.slice(0, -1).join(", ")} ${lien} ${l[l.length - 1]}`;
}

/** Les jours dans l'ordre de la semaine : « le lundi, le mardi et le jeudi »,
    « du mardi au jeudi » dès que trois jours ou plus se suivent. */
export function joursFr(jours, { article = true, lien = "et" } = {}) {
  const tries = [...new Set(jours)].sort((a, b) => JOURS.indexOf(a) - JOURS.indexOf(b));
  const bas = tries.map((j) => j.toLowerCase());
  const idx = tries.map((j) => JOURS.indexOf(j));
  const suivis = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  if (tries.length >= 3 && suivis) return `du ${bas[0]} au ${bas[bas.length - 1]}`;
  return listeFr(bas.map((j) => (article ? `le ${j}` : j)), lien);
}

export const creneaux = (pred) =>
  PLANNING.filter(pred).sort((a, b) => JOURS.indexOf(a.d) - JOURS.indexOf(b.d) || minutes(a.h) - minutes(b.h));

/** Les coachs d'une discipline, le plus présent d'abord. Jamais d'heure. */
export function coachsDe(...discs) {
  const n = new Map();
  for (const c of PLANNING) if (discs.includes(c.disc) && c.coach) n.set(c.coach, (n.get(c.coach) || 0) + 1);
  return [...n.entries()].sort((a, b) => b[1] - a[1]).map(([nom]) => nom);
}

export const combien = (disc) => PLANNING.filter((c) => c.disc === disc).length;

/* L'étage de préparation physique : ses heures d'accès libre et la
   personne qui s'en occupe vivent dans data-disciplines.js (fiche « cross »),
   pas dans le planning — ce n'est pas un cours. */
const cross = DISCIPLINES.find((d) => d.key === "cross") || { points: [] };
const plages = (cross.points || [])
  .map((p) => /(\d{1,2}h\d{0,2})\s*[–-]\s*(\d{1,2}h\d{0,2})\s+et\s+(\d{1,2}h\d{0,2})\s*[–-]\s*(\d{1,2}h\d{0,2})/.exec(p))
  .find(Boolean);
export const ETAGE = plages
  ? { matin: [plages[1], plages[2]], apresMidi: [plages[3], plages[4]] }
  : null;
export const COACH_ETAGE = (cross.points || [])
  .map((p) => /Coach\s+(\p{Lu}[\p{L}-]+)/u.exec(p))
  .find(Boolean)?.[1] || null;

/* Le nombre de sacs lourds, tel que la fiche équipement l'annonce. */
const sacs = Number((SPECS.find((s) => /sacs lourds/i.test(s.l)) || {}).v);
export const SACS = Number.isFinite(sacs) && sacs > 0 ? sacs : null;

/* Ouverture, fermeture et jours fermés, depuis les horaires publiés. */
const plage = /(\d{1,2}h\d{2})\s*[–-]\s*(\d{1,2}h\d{2})/.exec(SALLE.hours || "");
export const OUVERTURE = plage ? plage[1] : null;
export const FERMETURE = plage ? plage[2] : null;
export const JOURS_FERMES = (SALLE.hoursData || [])
  .filter((h) => /ferm/i.test(h.h))
  .map((h) => h.d.toLowerCase());
