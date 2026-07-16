/* =====================================================================
   MINIMES · galerie.js — "La galerie" subpage
   Mosaïque N&B du pool photo réel (data.js GALLERY), filtres par zone,
   légendes mono, lazy, + lightbox plein écran. Énergie mur-de-champion.
   ===================================================================== */
import { GALLERY } from "./data.js?v=b5";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function renderFilters() {
  const box = $("#ga-filters");
  if (!box) return;
  box.innerHTML = GALLERY.filters
    .map(
      (f, i) => `<button class="ga-filter ${i === 0 ? "is-on" : ""}" type="button" data-zone="${f.key}" aria-pressed="${i === 0}">${f.label}</button>`
    )
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
