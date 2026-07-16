/* =====================================================================
   MINIMES · activites.js — "Les activités" subpage
   Catalogue complet : un écran par discipline (rangées, pas de grille),
   avec sommaire ancré (#<key>). Rendu depuis data.js (DISCIPLINES enrichi
   des champs `for` + `points`). Rien en dur dans le markup répété.
   ===================================================================== */
import { DISCIPLINES, LINKS, CTA } from "./data.js?v=b5";

const $ = (s, r = document) => r.querySelector(s);

function renderIndex() {
  const box = $("#act-index");
  if (!box) return;
  box.innerHTML = DISCIPLINES.map(
    (d, i) => `<a class="act-chip" href="#${d.key}" data-magnetic>
      <span class="act-chip__n">${String(i + 1).padStart(2, "0")}</span>${d.name}
    </a>`
  ).join("");
}

function renderRows() {
  const box = $("#act-rows");
  if (!box) return;
  box.innerHTML = DISCIPLINES.map(
    (d, i) => `<article class="act ${i % 2 ? "act--rev" : ""}" id="${d.key}">
      <div class="act__media media" data-img="${d.img}" data-label="${d.name}" aria-hidden="true"></div>
      <div class="act__body">
        <span class="act__bigidx" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
        <span class="act__tag">${d.tag}</span>
        <h2 class="act__name">${d.name}</h2>
        <p class="act__desc">${d.desc}</p>
        <p class="act__for"><span>Pour qui</span>${d.for}</p>
        <ul class="act__points">${d.points.map((p) => `<li>${p}</li>`).join("")}</ul>
        <div class="act__cta">
          <a class="btn btn--primary" data-magnetic href="${LINKS.essai}"><span>${CTA.primary}</span></a>
          <a class="btn btn--ghost" data-magnetic href="/plannings/"><span>Voir les créneaux</span></a>
        </div>
      </div>
    </article>`
  ).join("");
}

function boot() {
  renderIndex();
  renderRows();

  window.BC.media(document);
  window.BC.reveal(document);
  window.BC.magnetic(document);

  const start = () => { window.BC.refresh(); window.BC.initKinetics(); };
  window.addEventListener("load", start);
  setTimeout(start, 500);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
