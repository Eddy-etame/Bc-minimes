/* =====================================================================
   MINIMES · coachs.js — "Les coachs" subpage
   Roster Minimes vérifié (data.js COACHES ← roster.json). Un pilier mis
   en avant (Mehdi B, photo prouvée), les autres en tuiles nom N&B.
   Loi §0.10 : nom ≡ photo, jamais de stock, jamais de croisement.
   ===================================================================== */
import { COACHES, LINKS, CTA, CTA_HREF } from "./data.js?v=b25";
import { PLANNING, PLANNING_DAYS } from "./data-planning.js?v=b25";

const $ = (s, r = document) => r.querySelector(s);

/* Le nom du coach dans PLANNING est la clé de jointure. `weekOf` compte
   ses créneaux et `linkOf` construit le lien filtré : « Ses créneaux »
   livre enfin SES créneaux, et pas la semaine entière comme avant. */
const weekOf = (name) => PLANNING.filter((s) => s.coach === name).length;
const linkOf = (name) => `/plannings/?coach=${encodeURIComponent(name)}`;
/* les jours où il/elle est là — dérivés, jamais tapés */
const daysOf = (name) => [...new Set(PLANNING.filter((s) => s.coach === name).map((s) => s.d))];

function renderPillar() {
  const el = $("#pillar");
  if (!el) return;
  const c = COACHES.pillar;
  el.innerHTML = `
    <div class="pillar__stage">
      <span class="pillar__bigname" aria-hidden="true">${c.bigname}</span>
      <img class="pillar__cut" src="${c.img}" width="236" height="452" alt="${c.name}, ${c.role} de Boxing Center Minimes" decoding="async" fetchpriority="high" />
    </div>
    <div class="pillar__body">
      <span class="pillar__role">${c.role} · <i>${c.tag}</i></span>
      <h2 class="pillar__name">${c.name}</h2>
      <ul class="pillar__disc">${c.disciplines.map((d) => `<li>${d}</li>`).join("")}</ul>
      <p class="pillar__bio">${c.bio}</p>
      <p class="pillar__note">${c.note}</p>
      <p class="pillar__week"><b>${weekOf(c.planName)}</b> créneaux par semaine, sur ${daysOf(c.planName).length} jours</p>
      <div class="pillar__cta">
        <a class="btn btn--primary" data-magnetic href="${CTA_HREF.primary}"><span>${CTA.primary}</span></a>
        <a class="btn btn--ghost" data-magnetic href="${linkOf(c.planName)}"><span>Ses créneaux</span></a>
      </div>
    </div>`;
}

function renderRoster() {
  const box = $("#roster");
  if (!box) return;
  box.innerHTML = COACHES.roster
    .map(
      (c) => `<article class="coach">
        <span class="coach__mono" aria-hidden="true">${c.initials}</span>
        <div class="coach__body">
          <span class="coach__role">${c.role}</span>
          <h3 class="coach__name">${c.name}</h3>
          <p class="coach__note">${c.note}</p>
          <a class="coach__link" href="${linkOf(c.planName)}">${weekOf(c.planName)} créneau${weekOf(c.planName) > 1 ? "x" : ""} par semaine <span aria-hidden="true">→</span><span class="sr-only">— voir les créneaux de ${c.name}</span></a>
        </div>
        <span class="coach__pending">Portrait à venir</span>
      </article>`
    )
    .join("");
  const pend = $("#pending");
  if (pend) pend.textContent = COACHES.pending;
}

/* ---------------------- QUI EST LÀ, QUEL JOUR ----------------------
   La page répondait « qui coache ici » mais pas « il est là quand ? ».
   Tout est DÉRIVÉ de PLANNING : l’ordre des jours, les noms présents, le
   nombre de créneaux. Aucun nom, aucun jour tapé dans le markup (§0.10) —
   si Hicham prend le vendredi dans data.js, il apparaît ici tout seul.

   L’ordre à l’intérieur d’un jour n’est PAS alphabétique : c’est l’ordre
   d’entrée sur le parquet (premier créneau du jour). Le premier nom de la
   colonne est donc celui que tu croises si tu arrives à l’ouverture. */
function renderWeek() {
  const box = document.getElementById("cweek");
  if (!box) return;
  const mins = (h) => { const [a, b] = String(h).split("h"); return Number(a) * 60 + Number(b || 0); };

  box.innerHTML = PLANNING_DAYS.map((day) => {
    const slots = PLANNING.filter((s) => s.d === day).sort((a, b) => mins(a.h) - mins(b.h));
    const order = [];
    slots.forEach((s) => { if (!order.includes(s.coach)) order.push(s.coach); });
    const lines = order
      .map((name) => {
        const n = slots.filter((s) => s.coach === name).length;
        const href = `/plannings/?jour=${encodeURIComponent(day.toLowerCase())}&coach=${encodeURIComponent(name)}`;
        return `<li><a class="cwd__a" href="${href}">
          <span class="cwd__n">${name}</span>
          <span class="cwd__c">${n} créneau${n > 1 ? "x" : ""}</span>
          <span class="sr-only">— voir le ${day.toLowerCase()} de ${name} dans la grille</span>
        </a></li>`;
      })
      .join("");
    return `<div class="cwd">
      <h3 class="cwd__h">${day}<i>${slots.length} cours</i></h3>
      <ul class="cwd__list">${lines}</ul>
    </div>`;
  }).join("");
}

function boot() {
  renderPillar();
  renderRoster();
  renderWeek();

  window.BC.media(document);
  window.BC.reveal(document);
  window.BC.magnetic(document);

  const start = () => { window.BC.refresh(); window.BC.initKinetics(); };
  window.addEventListener("load", start);
  setTimeout(start, 500);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
