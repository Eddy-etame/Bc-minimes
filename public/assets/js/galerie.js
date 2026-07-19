/* =====================================================================
   MINIMES · galerie.js — "La galerie" subpage
   Mosaïque N&B du pool photo réel (data.js GALLERY), filtres par zone,
   légendes mono, lazy, + lightbox plein écran. Énergie mur-de-champion.
   ===================================================================== */
import { GALLERY, DISCIPLINES } from "./data.js?v=b8";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* Le compte par zone est dérivé des photos elles-mêmes : un filtre qui
   annonce « 4 » et en montre 3 est un filtre qui ment. */
const countIn = (key) => (key === "all" ? GALLERY.shots.length : GALLERY.shots.filter((s) => s.zone === key).length);

function renderFilters() {
  const box = $("#ga-filters");
  if (!box) return;
  box.innerHTML = GALLERY.filters
    .map(
      (f, i) => `<button class="ga-filter ${i === 0 ? "is-on" : ""}" type="button" data-zone="${f.key}" aria-pressed="${i === 0}">${f.label}<i>${countIn(f.key)}</i></button>`
    )
    .join("");
}

/* ------------------- CE QUE LE CADRE COUPE ------------------------
   La page ne montrait qu'une mosaïque et s'arrêtait là — l'écran le plus
   maigre des huit. Elle ne peut pas prétendre montrer LA salle des
   Minimes (le shooting n'a pas eu lieu) : elle assume donc l'inverse et
   dit ce qu'aucune photo ne rend. Honnête, et propre à cette page. */
function renderOffFrame() {
  const box = $("#ga-offframe");
  if (!box) return;
  box.innerHTML = GALLERY.offFrame.map(
    (v) => `<div class="value"><span class="value__n">${v.n}</span><div><h3 class="value__t">${v.t}</h3><p class="value__d">${v.d}</p></div></div>`
  ).join("");
}

/* ------------------- DE LA PHOTO AU CRÉNEAU ------------------------
   Une galerie qui ne mène nulle part est un cul-de-sac. Chaque zone
   photo renvoie vers la discipline correspondante — jointure par clé,
   donc aucune discipline fantôme ne peut apparaître ici. */
const ZONE_TO_DISC = { anglaise: "anglaise", lady: "lady", educative: "educative", technique: "paos", salle: null };

function renderBridge() {
  const box = $("#ga-bridge");
  if (!box) return;
  box.innerHTML = GALLERY.filters
    .filter((f) => ZONE_TO_DISC[f.key])
    .map((f) => {
      const d = DISCIPLINES.find((x) => x.key === ZONE_TO_DISC[f.key]);
      if (!d) return "";
      return `<a class="ga-bridge__card" href="/activites/#${d.key}">
        <span class="ga-bridge__z">${f.label}</span>
        <span class="ga-bridge__n">${d.name}</span>
        <span class="ga-bridge__d">${d.tag}</span>
        <span class="ga-bridge__go" aria-hidden="true">Voir la discipline →</span>
      </a>`;
    })
    .join("");
}

function renderGrid() {
  const box = $("#ga-grid");
  if (!box) return;
  box.innerHTML = GALLERY.shots
    .map(
      (s, i) => `<figure class="ga-cell media ${s.big ? "ga-cell--big" : ""}" data-zone="${s.zone}" data-img="${s.img}" data-label="${s.label}" role="button" tabindex="0" aria-label="Agrandir : ${s.label}" style="--i:${i}"></figure>`
    )
    .join("");
}

/* --------------------------- FILTRES ------------------------------ */
function initFilters() {
  const filters = $$(".ga-filter");
  const cells = $$(".ga-cell");
  filters.forEach((btn) =>
    btn.addEventListener("click", () => {
      filters.forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", String(on));
      });
      const z = btn.dataset.zone;
      cells.forEach((c) => {
        const show = z === "all" || c.dataset.zone === z;
        c.classList.toggle("is-hidden", !show);
      });
      window.BC.refresh();
    })
  );
}

/* --------------------------- LIGHTBOX -----------------------------
   ⚠ `role="dialog" aria-modal="true"` est un CONTRAT : il promet que le
   focus entre, reste, et revient. Avant, il ne faisait rien de tout ça —
   le focus restait sur <body> et cinq Tab sortaient du modal ouvert pour
   aller dans la nav et le menu fermé derrière. L'attribut mentait à l'AT. */
function initLightbox() {
  const lb = $("#ga-lightbox");
  if (!lb) return;
  const imgEl = lb.querySelector(".ga-lb__img");
  const capEl = lb.querySelector(".ga-lb__cap");
  const closeBtn = lb.querySelector("[data-lb-close]");
  let lastFocused = null;

  const open = (cell) => {
    const src = cell.querySelector("img")?.src || cell.dataset.img;
    imgEl.src = src;
    imgEl.alt = cell.dataset.label || "";
    capEl.textContent = cell.dataset.label || "";
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("is-locked");
    lastFocused = cell;                 // d'où on vient
    closeBtn?.focus();                  // le focus ENTRE
  };
  const close = () => {
    if (!lb.classList.contains("is-open")) return;
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("is-locked");
    lastFocused?.focus();               // et il REVIENT sur la cellule cliquée
    lastFocused = null;
  };

  $$(".ga-cell").forEach((cell) => {
    cell.addEventListener("click", () => open(cell));
    cell.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(cell); }
    });
  });
  lb.addEventListener("click", (e) => { if (e.target.closest("[data-lb-close]") || e.target === lb) close(); });

  addEventListener("keydown", (e) => {
    if (e.key === "Escape") { close(); return; }
    // piège à focus : un seul contrôle dans le modal → Tab y reste
    if (e.key === "Tab" && lb.classList.contains("is-open")) {
      e.preventDefault();
      closeBtn?.focus();
    }
  });
}

function boot() {
  renderFilters();
  renderGrid();
  renderOffFrame();
  renderBridge();

  window.BC.media(document);
  window.BC.reveal(document);
  window.BC.magnetic(document);
  initFilters();
  initLightbox();

  const start = () => { window.BC.refresh(); window.BC.initKinetics(); };
  window.addEventListener("load", start);
  setTimeout(start, 500);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
