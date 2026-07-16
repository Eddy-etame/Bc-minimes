/* =====================================================================
   MINIMES · contact.js — "Contact & accès" subpage
   Rendu depuis data.js : coordonnées (SALLE) + carte + FAQ locale (FAQ).
   La FAQ visible est le miroir exact du FAQPage LD-JSON de la page.
   ===================================================================== */
import { SALLE, FAQ } from "./data.js?v=b5";

const $ = (s, r = document) => r.querySelector(s);

function renderContact() {
  const a = $("#addr");
  if (a) { a.textContent = SALLE.address.full; a.href = SALLE.mapsLink; }
  const access = $("#access");
  if (access) access.innerHTML = SALLE.access.map((x) => `<li>${x}</li>`).join("");
  const hours = $("#hours");
  if (hours) hours.innerHTML = SALLE.hoursData.map((h) => `${h.d} · ${h.h}`).join("<br>");
  const p = $("#phone");
  if (p) { p.textContent = SALLE.phone; p.href = "tel:" + SALLE.phoneHref; }
  const em = $("#email");
  if (em) { em.textContent = SALLE.email; em.href = "mailto:" + SALLE.email; }
  const map = $("#map");
  if (map) map.src = SALLE.mapsUrl;
}

/* La FAQ CANONIQUE — /contact/ uniquement, miroir exact du FAQPage LD-JSON.
   ⚠ chaque `role="region"` a besoin d'un NOM (aria-labelledby) : six régions
   anonymes n'aident personne. Et le panneau replié doit vraiment être replié :
   `max-height:0` seul le laissait dans l'arbre d'accessibilité pendant
   qu'aria-expanded="false" prétendait le contraire (club.css ajoute le
   `visibility:hidden` qui le retire pour de bon). */
function renderFaq() {
  const box = $("#faq");
  if (!box) return;
  box.innerHTML = FAQ.map(
    (f, i) => `<div class="faq__item">
      <button class="faq__q" id="faq-q-${i}" aria-expanded="false" aria-controls="faq-a-${i}"><span>${f.q}</span><span class="faq__sign" aria-hidden="true"></span></button>
      <div class="faq__a" id="faq-a-${i}" role="region" aria-labelledby="faq-q-${i}"><p>${f.a}</p></div>
    </div>`
  ).join("");
  box.querySelectorAll(".faq__item").forEach((item) => {
    const q = item.querySelector(".faq__q");
    const a = item.querySelector(".faq__a");
    q.addEventListener("click", () => {
      const open = item.classList.toggle("is-open");
      q.setAttribute("aria-expanded", String(open));
      a.style.maxHeight = open ? a.scrollHeight + "px" : "0px";
    });
  });
}

function boot() {
  renderContact();
  renderFaq();

  window.BC.media(document);
  window.BC.reveal(document);
  window.BC.magnetic(document);

  const start = () => { window.BC.refresh(); window.BC.initKinetics(); };
  window.addEventListener("load", start);
  setTimeout(start, 500);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
