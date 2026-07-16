/* =====================================================================
   MINIMES · plannings.js — "Le planning"
   STANDARDS §3 exige DEUX choses sur cette page : le poster officiel en
   couleur, cliquable — ET « une grille HTML utilisable (filtres jour /
   discipline / coach depuis data.js) ». La grille n'existait pas : toute
   la semaine était enfermée dans un PNG de 2 Mo — illisible pour Google,
   pour un lecteur d'écran et pour un téléphone bridé, et impossible à
   filtrer. Ce module la rend.

   Source : PLANNING (data.js) ← transcription du poster SAISON 2026-2027.
   Aucun créneau, aucun nom de coach n'est tapé dans le HTML (§0.10) :
   si Chloé quitte la salle, elle disparaît de la page en une ligne de data.
   ===================================================================== */
import { SEASON_LABEL, PLANNING, PLANNING_DAYS, PLANNING_DISCIPLINES, PLANNING_KEYS } from "./data.js?v=b5";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* état des trois filtres — "all" = tout */
const state = { d: "all", disc: "all", coach: "all" };

/* les coachs viennent du planning lui-même — jamais d'une liste parallèle
   qui se désynchronise */
const COACHES_IN_PLANNING = [...new Set(PLANNING.map((s) => s.coach))];

const labelOf = (key) => (PLANNING_DISCIPLINES.find((d) => d.key === key) || {}).label || key;

/* ------------------------------ FILTRES ---------------------------- */
function chipRow(group, items, allLabel) {
  return (
    `<button class="pl-chip is-on" type="button" role="radio" aria-checked="true" data-group="${group}" data-val="all">${allLabel}</button>` +
    items
      .map(
        (it) =>
          `<button class="pl-chip" type="button" role="radio" aria-checked="false" data-group="${group}" data-val="${it.val}">${it.label}</button>`
      )
      .join("")
  );
}

function renderFilters() {
  const box = $("#pl-filters");
  if (!box) return;
  box.innerHTML = `
    <div class="pl-fgroup" role="radiogroup" aria-label="Filtrer par jour">
      <span class="pl-fgroup__l">Jour</span>
      <div class="pl-fgroup__row">${chipRow("d", PLANNING_DAYS.map((d) => ({ val: d, label: d })), "Toute la semaine")}</div>
    </div>
    <div class="pl-fgroup" role="radiogroup" aria-label="Filtrer par discipline">
      <span class="pl-fgroup__l">Discipline</span>
      <div class="pl-fgroup__row">${chipRow("disc", PLANNING_DISCIPLINES.map((d) => ({ val: d.key, label: d.label })), "Toutes")}</div>
    </div>
    <div class="pl-fgroup" role="radiogroup" aria-label="Filtrer par coach">
      <span class="pl-fgroup__l">Coach</span>
      <div class="pl-fgroup__row">${chipRow("coach", COACHES_IN_PLANNING.map((c) => ({ val: c, label: c })), "Tous")}</div>
    </div>`;
}

/* ------------------------------ GRILLE -----------------------------
   Six colonnes-jour au bureau, six sections empilées sur téléphone.
   Structure sémantique (h3 + ul) plutôt qu'un <table> : une semaine de
   boxe n'est pas un tableau de données croisées, et six colonnes à 375px
   sont illisibles. Chaque créneau porte ses data-* pour le filtre — et
   son texte reste indexable, contrairement au poster. */
function renderGrid() {
  const box = $("#pl-grid");
  if (!box) return;
  box.innerHTML = PLANNING_DAYS.map((day) => {
    const slots = PLANNING.filter((s) => s.d === day).sort((a, b) => a.h.localeCompare(b.h));
    return `<section class="pl-day" data-day="${day}">
      <h3 class="pl-day__h">${day}<i>${slots.length}</i></h3>
      <ul class="pl-day__list">
        ${slots
          .map(
            (s) => `<li class="pl-slot" data-day="${s.d}" data-disc="${s.disc}" data-coach="${s.coach}">
            <span class="pl-slot__h">${s.h}${s.end ? `<i>–${s.end}</i>` : ""}</span>
            <span class="pl-slot__n">${s.name}</span>
            <span class="pl-slot__m"><b>${s.coach}</b> · ${s.age}</span>
          </li>`
          )
          .join("")}
      </ul>
      <p class="pl-day__empty">Rien ce jour-là avec ce filtre.</p>
    </section>`;
  }).join("");
}

/* ------------------------------ FILTRAGE ---------------------------- */
function apply() {
  let shown = 0;
  $$(".pl-day").forEach((dayEl) => {
    const dayOk = state.d === "all" || dayEl.dataset.day === state.d;
    let visibleInDay = 0;
    $$(".pl-slot", dayEl).forEach((s) => {
      const ok =
        dayOk &&
        (state.disc === "all" || s.dataset.disc === state.disc) &&
        (state.coach === "all" || s.dataset.coach === state.coach);
      s.classList.toggle("is-hidden", !ok);
      if (ok) visibleInDay++;
    });
    dayEl.classList.toggle("is-empty", visibleInDay === 0);
    dayEl.classList.toggle("is-hidden", !dayOk);
    shown += visibleInDay;
  });

  /* compteur en région live : au clavier et au lecteur d'écran, sans lui,
     rien ne dit que le filtre a changé quoi que ce soit */
  const out = $("#pl-count");
  if (out) {
    const bits = [];
    if (state.disc !== "all") bits.push(labelOf(state.disc));
    if (state.coach !== "all") bits.push(`avec ${state.coach}`);
    if (state.d !== "all") bits.push(state.d.toLowerCase());
    out.textContent =
      shown === 0
        ? "Aucun créneau avec ce filtre — enlève-en un."
        : `${shown} créneau${shown > 1 ? "x" : ""}${bits.length ? " · " + bits.join(" · ") : " sur la semaine"}`;
  }
  window.BC.refresh();
}

function initFilters() {
  $$(".pl-chip").forEach((btn) =>
    btn.addEventListener("click", () => {
      const g = btn.dataset.group;
      $$(`.pl-chip[data-group="${g}"]`).forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-checked", String(on));
      });
      state[g] = btn.dataset.val;
      apply();
    })
  );
}

/* Le rail de la semaine — la structure PROPRE à cette page (les 5 autres
   sous-pages partagent .page-head, chacune avec son objet à elle : ici la
   semaine comme forme, une barre par créneau). Dérivé de PLANNING : il ne
   peut pas mentir sur le nombre de cours. */
function renderWeek() {
  const box = $("#pl-week");
  if (!box) return;
  box.innerHTML = PLANNING_DAYS.map((day) => {
    const n = PLANNING.filter((s) => s.d === day).length;
    return `<span class="pl-week__d">
      <span class="pl-week__n">${day.slice(0, 3)}</span>
      <span class="pl-week__bar">${Array.from({ length: n }, () => "<i></i>").join("")}</span>
      <span class="pl-week__c">${n} cours</span>
    </span>`;
  }).join("");
}

/* les repères — rendus depuis data.js, jamais tapés dans le markup */
function renderKeys() {
  const box = $("#reperes");
  if (!box) return;
  box.innerHTML = PLANNING_KEYS.map(
    (v) => `<div class="value"><span class="value__n">${v.n}</span><div><h3 class="value__t">${v.t}</h3><p class="value__d">${v.d}</p></div></div>`
  ).join("");
}

function boot() {
  const season = document.getElementById("season");
  if (season) season.textContent = SEASON_LABEL;   // anti-péremption §4

  renderWeek();
  renderFilters();
  renderGrid();
  renderKeys();
  initFilters();
  apply();

  window.BC.media(document);
  window.BC.reveal(document);
  window.BC.magnetic(document);
  const start = () => { window.BC.refresh(); window.BC.initKinetics(); };
  window.addEventListener("load", start);
  setTimeout(start, 500);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
