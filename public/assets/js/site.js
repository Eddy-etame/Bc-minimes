/* =====================================================================
   MINIMES · site.js (v2) — chrome + heavy motion engine
   window.BC = { reveal, magnetic, refresh, media, split, scramble,
                 initKinetics, faq, lenis, velocity }
   ===================================================================== */
import { NAV, LINKS, SALLE, MEDIA, CTA } from "./data.js?v=b8";

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
if (!gsap) document.documentElement.classList.remove("fx");

let lenis = null;
let velocity = 0;          // smoothed scroll velocity (shared)

/* ----------------------------- NAV / MENU ------------------------- */
function currentPath() {
  let p = location.pathname.replace(/index\.html$/, "");
  if (!p.endsWith("/")) p += "/";
  return p;
}
function mountNav() {
  const path = currentPath();
  const links = NAV.map(
    (n) => `<a href="${n.href}"${n.href === path ? ' aria-current="page"' : ""}>${n.label}</a>`
  ).join("");
  document.getElementById("nav").innerHTML = `
    <nav class="nav" id="site-nav">
      <a class="nav__brand" href="/" aria-label="Boxing Center Minimes — accueil">
        <img class="nav__logo" src="/assets/img/logo.png" alt="" width="342" height="160" />
        <span class="nav__salle">Minimes</span>
      </a>
      <div class="nav__links">${links}</div>
      <div class="nav__right">
        <a class="btn btn--primary nav__cta" data-magnetic href="${LINKS.essai}"><span>${CTA.chrome}</span></a>
        <button class="burger" id="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </nav>`;

  const menuLinks = NAV.map(
    (n, i) => `<a class="menu__link" href="${n.href}"><span class="n">${String(i + 1).padStart(2, "0")}</span>${n.label}</a>`
  ).join("");
  document.getElementById("drawer").innerHTML = `
    <div class="menu" id="menu" aria-hidden="true">
      <div class="menu__bg" aria-hidden="true"><video data-video="/assets/media/clip-mats.mp4" data-poster="/assets/img/bc/salle-1.webp" muted loop playsinline></video></div>
      <div class="menu__top">
        <a class="nav__brand" href="/" aria-label="Boxing Center Minimes — accueil">
          <img class="nav__logo" src="/assets/img/logo.png" alt="" width="342" height="160" />
          <span class="nav__salle">Minimes</span>
        </a>
        <button class="menu__close" id="menu-close">Fermer <span aria-hidden="true">✕</span></button>
      </div>
      <nav class="menu__nav">${menuLinks}</nav>
      <div class="menu__foot">
        <a class="btn btn--primary" data-magnetic href="${LINKS.essai}"><span>${CTA.primary}</span></a>
        <div style="display:flex;gap:1.4rem;flex-wrap:wrap">
          <a href="${LINKS.boutique}" target="_blank" rel="noopener">Boutique ↗</a>
          <a href="${LINKS.instagram}" target="_blank" rel="noopener">Instagram ↗</a>
          <a href="tel:${SALLE.phoneHref}">${SALLE.phone}</a>
        </div>
      </div>
    </div>`;

  const nav = document.getElementById("site-nav");
  const burger = document.getElementById("burger");
  const menu = document.getElementById("menu");
  const items = menu.querySelectorAll(".menu__link");
  const setOpen = (open) => {
    document.documentElement.classList.toggle("is-menu-open", open);
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    burger.setAttribute("aria-expanded", String(open));
    document.documentElement.classList.toggle("is-locked", open);
    if (lenis) open ? lenis.stop() : lenis.start();
    if (gsap && !reduce) {
      if (open) gsap.fromTo(items, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: "power4.out", stagger: 0.06, delay: 0.18 });
    }
  };
  burger.addEventListener("click", () => setOpen(!menu.classList.contains("is-open")));
  document.getElementById("menu-close").addEventListener("click", () => setOpen(false));
  menu.querySelectorAll(".menu__link, .menu__foot a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });

  // scroll state: hide on down, show on up, solid bg after hero
  let last = 0;
  ScrollTrigger?.create({
    start: 0, end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle("is-scrolled", y > 80);
      if (y > last && y > 400 && !menu.classList.contains("is-open")) nav.classList.add("is-hidden");
      else nav.classList.remove("is-hidden");
      last = y;
    },
  });
}

function mountFooter() {
  const cols = [
    { h: "Le club", links: NAV.slice(1, 5) },
    { h: "Pratique", links: [{ href: "/plannings/", label: "Planning" }, { href: "/tarifs/", label: "Tarifs" }, { href: "/contact/", label: "Contact" }, { href: LINKS.boutique, label: "Boutique ↗" }] },
    { h: "Le réseau", links: [{ href: LINKS.groupe, label: "Boxing Center ↗" }, { href: "https://www.boxing-center-portet.fr/", label: "Portet ↗" }, { href: LINKS.instagram, label: "Instagram ↗" }, { href: LINKS.facebook, label: "Facebook ↗" }] },
  ];
  document.getElementById("footer").innerHTML = `
    <footer class="footer">
      <div class="wrap">
        <div class="footer__big" data-skew aria-hidden="true">Le berceau des champions</div>
        <div class="footer__grid">
          <div class="footer__col">
            <h4>Boxing Center Minimes</h4>
            <p>${SALLE.address.full}</p>
            <p><a href="tel:${SALLE.phoneHref}">${SALLE.phone}</a></p>
            <p>${SALLE.hours}</p>
            <a class="btn btn--primary" data-magnetic href="${LINKS.essai}" style="margin-top:1rem"><span>${CTA.primary}</span></a>
          </div>
          ${cols.map((c) => `<div class="footer__col"><h4>${c.h}</h4>${c.links.map((l) => `<a href="${l.href}">${l.label}</a>`).join("")}</div>`).join("")}
        </div>
        <div class="footer__bottom">
          <span>© ${new Date().getFullYear()} Boxing Center — Maquette Minimes</span>
          <span>Toulouse · Les Minimes · 31200</span>
        </div>
      </div>
    </footer>`;
}

/* ------------------------------ LENIS ----------------------------- */
function initSmooth() {
  if (reduce || !window.Lenis) return;
  lenis = new window.Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on("scroll", (e) => { velocity = e.velocity; ScrollTrigger?.update(); });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute("href").length > 1) {
      const el = document.querySelector(a.getAttribute("href"));
      if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -80 }); }
    }
  });
}

/* ------------------------------ CURSOR ---------------------------- */
function initCursor() {
  if (window.matchMedia("(hover: none)").matches) return;
  const ring = document.querySelector(".cursor");
  const dot = document.querySelector(".cursor__dot");
  const label = ring?.querySelector(".cursor__label");
  if (!ring) return;
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; });
  const loop = () => { rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); };
  loop();
  const sel = "a, button, [data-magnetic], .disc, .value, .tarif";
  document.addEventListener("mouseover", (e) => {
    const t = e.target.closest(sel);
    if (t) { ring.classList.add("is-hover"); if (label) label.textContent = t.dataset.cursor || (t.closest(".disc") ? "voir" : "→"); }
  });
  document.addEventListener("mouseout", (e) => { if (e.target.closest(sel)) ring.classList.remove("is-hover"); });
}

/* ----------------------------- MAGNETIC --------------------------- */
function magnetic(scope = document) {
  if (reduce || window.matchMedia("(hover: none)").matches) return;
  scope.querySelectorAll("[data-magnetic]").forEach((el) => {
    if (el.dataset.magBound) return; el.dataset.magBound = "1";
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.4, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.5, ease: "power3.out" });
    });
    el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" }));
  });
}

/* ----------------------------- SPLIT ------------------------------ */
function split(el) {
  if (el.dataset.splitDone) return [...el.querySelectorAll(".char")];
  el.dataset.splitDone = "1";
  const text = el.textContent;
  el.textContent = "";
  const chars = [];
  [...text].forEach((ch) => {
    const s = document.createElement("span");
    s.className = "char";
    s.textContent = ch === " " ? " " : ch;
    el.appendChild(s); chars.push(s);
  });
  return chars;
}

/* ----------------------------- SCRAMBLE --------------------------- */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\*";
function scramble(el, opts = {}) {
  if (reduce) return;
  const final = el.dataset.text || el.textContent;
  el.dataset.text = final;
  const dur = opts.dur || 700;
  let start = null;
  const step = (ts) => {
    if (!start) start = ts;
    const p = Math.min(1, (ts - start) / dur);
    const reveal = Math.floor(p * final.length);
    let out = "";
    for (let i = 0; i < final.length; i++) {
      out += i < reveal || final[i] === " " ? final[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (p < 1) requestAnimationFrame(step); else el.textContent = final;
  };
  requestAnimationFrame(step);
}

/* ----------------------------- REVEAL ----------------------------- */
function reveal(scope = document) {
  if (reduce) { document.documentElement.classList.remove("fx"); return; }
  scope.querySelectorAll(".reveal-mask").forEach((m) => {
    const kids = [...m.children];
    if (m.dataset.revBound || !kids.length) return; m.dataset.revBound = "1";
    gsap.set(kids, { yPercent: 110, opacity: 0 });
    gsap.to(kids, { yPercent: 0, opacity: 1, duration: 1.1, ease: "power4.out", stagger: 0.08, scrollTrigger: { trigger: m, start: "top 90%" } });
  });
  scope.querySelectorAll("[data-reveal]").forEach((el) => {
    if (el.dataset.revBound) return; el.dataset.revBound = "1";
    gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%" } });
  });
  scope.querySelectorAll("[data-reveal-group]").forEach((g) => {
    const kids = [...g.children];
    if (g.dataset.revBound || !kids.length) return; g.dataset.revBound = "1";
    gsap.set(kids, { opacity: 0, y: 40 });
    gsap.to(kids, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: g, start: "top 88%" } });
  });
}

/* --------------------------- MEDIA HYDRATE ------------------------
   `local()` décide si un chemin est SERVI PAR NOUS ou par le pool photo
   distant (MEDIA). ⚠ Le piège déjà payé : l'exemption ne couvrait que
   /assets, donc /media/clip-mats.mp4 et /img/gym-21.jpg — des fichiers
   LOCAUX — se faisaient préfixer du domaine Portet, qui répond 403 depuis
   l'anti-scraping → une erreur console sur les 8 pages. Une maquette
   Minimes ne dépend JAMAIS du domaine de Portet pour son propre poster. */
const local = (p) => /^(https?:|data:|\/assets|\/media|\/img)/.test(p);
function hydrateMedia(scope = document) {
  scope.querySelectorAll(".media[data-img]").forEach((el) => {
    if (el.dataset.mediaBound) return; el.dataset.mediaBound = "1";
    const img = new Image();
    img.src = (local(el.dataset.img) ? "" : MEDIA) + el.dataset.img;
    img.alt = el.dataset.label || ""; img.loading = el.hasAttribute("data-eager") ? "eager" : "lazy"; img.decoding = "async";
    if (el.hasAttribute("data-eager")) img.fetchPriority = "high";
    el.prepend(img);
  });
  scope.querySelectorAll("video[data-video]").forEach((v) => {
    if (v.dataset.mediaBound) return; v.dataset.mediaBound = "1";
    v.muted = true; v.defaultMuted = true; v.playsInline = true; v.loop = true;
    if (v.dataset.poster) v.poster = (local(v.dataset.poster) ? "" : MEDIA) + v.dataset.poster;
    v.src = (local(v.dataset.video) ? "" : MEDIA) + v.dataset.video;
    v.load();
    const play = () => { v.muted = true; v.play().catch(() => {}); };
    v.addEventListener("loadeddata", play, { once: true });
    v.addEventListener("canplay", play, { once: true });
    play();
    _pendingVideos.push(v);
  });
}
const _pendingVideos = [];
/* autoplay can be blocked until a gesture — kick all videos on first input */
["pointerdown", "touchstart", "scroll", "keydown"].forEach((ev) =>
  addEventListener(ev, () => _pendingVideos.forEach((v) => { v.muted = true; v.play().catch(() => {}); }), { once: true, passive: true })
);

/* --------------------- VELOCITY: skew + marquees ------------------ */
let kineticsOn = false;
function initKinetics() {
  if (reduce || kineticsOn) return; kineticsOn = true;
  const skews = [...document.querySelectorAll("[data-skew]")];
  const tracks = [...document.querySelectorAll(".marquee__track")].map((t) => {
    const dir = t.dataset.dir === "rtl" ? 1 : -1;
    const half = t.scrollWidth / 2 || 1;
    return { el: t, dir, half, x: 0, base: parseFloat(t.dataset.speed || "1") };
  });
  let smooth = 0;
  gsap.ticker.add(() => {
    smooth += (velocity - smooth) * 0.1;
    const sk = gsap.utils.clamp(-7, 7, smooth * 0.35);
    skews.forEach((el) => (el.style.transform = `skewY(${sk * 0.5}deg)`));
    tracks.forEach((m) => {
      m.x += (m.base + Math.abs(smooth) * 0.25) * m.dir;
      if (m.dir < 0 && m.x <= -m.half) m.x += m.half;
      if (m.dir > 0 && m.x >= 0) m.x -= m.half;
      m.el.style.transform = `translateX(${m.x}px) skewX(${gsap.utils.clamp(-6, 6, -smooth * 0.18)}deg)`;
    });
    velocity *= 0.9;
  });
}

const refresh = () => ScrollTrigger?.refresh();

/* ------------------------- FAQ / ACCORDÉON ------------------------
   Deux pages posent des questions : /contact/ (la FAQ canonique, celle
   qui porte le FAQPage) et /tarifs/ (les questions d'argent). Le rendu
   ET le comportement vivent ici, une fois — sinon on maintient deux
   accordéons dont un seul reçoit la prochaine correction d'accessibilité.

   `id` préfixe les identifiants : deux accordéons sur une même page
   auraient des `aria-controls` en collision, et le lecteur d'écran
   ouvrirait la mauvaise réponse.

   Sur ouverture, `max-height` est posé en PIXELS — c'est ce qui rend la
   transition possible (`auto` ne s'anime pas). Mais figée à la valeur
   mesurée, une réponse qui se re-wrappe (rotation du téléphone, zoom
   texte, police système plus grosse) se retrouve tronquée par sa propre
   animation : le dernier paragraphe disparaît sous le pli.
   On relâche donc à `none` AU REDIMENSIONNEMENT, pas sur `transitionend` —
   cet événement ne se déclenche pas de façon fiable (transition annulée,
   onglet en arrière-plan, moteur qui coalesce le changement de style), et
   un filet qui ne tombe que parfois n'est pas un filet. */
let _faqResizeBound = false;
function bindFaqResize() {
  if (_faqResizeBound) return;
  _faqResizeBound = true;
  let t;
  addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(() => {
      document.querySelectorAll(".faq__item.is-open .faq__a").forEach((a) => (a.style.maxHeight = "none"));
      refresh();
    }, 150);
  });
}

function faq(box, items) {
  if (!box || !items?.length) return;
  bindFaqResize();
  const id = box.id || "faq";
  box.innerHTML = items
    .map(
      (f, i) => `<div class="faq__item">
      <button class="faq__q" type="button" id="${id}-q-${i}" aria-expanded="false" aria-controls="${id}-a-${i}"><span>${f.q}</span><span class="faq__sign" aria-hidden="true"></span></button>
      <div class="faq__a" id="${id}-a-${i}" role="region" aria-labelledby="${id}-q-${i}"><p>${f.a}</p></div>
    </div>`
    )
    .join("");
  box.querySelectorAll(".faq__item").forEach((item) => {
    const q = item.querySelector(".faq__q");
    const a = item.querySelector(".faq__a");
    q.addEventListener("click", () => {
      const open = item.classList.toggle("is-open");
      q.setAttribute("aria-expanded", String(open));
      clearTimeout(a._faqT);
      if (open) {
        a.classList.remove("is-closing");
        a.style.maxHeight = a.scrollHeight + "px";
      } else {
        /* `.is-closing` garde le texte VISIBLE le temps du repli — sinon
           il disparaît d'un coup pendant que la boîte, elle, se ferme
           tranquillement. Retiré sur horloge à la fin de l'animation :
           le panneau sort alors vraiment de l'arbre d'accessibilité,
           d'accord avec l'aria-expanded="false" du bouton. */
        a.classList.add("is-closing");
        /* on RE-FIXE la hauteur mesurée avant de retomber à 0 : une
           transition qui part de `none` ne s'anime pas, elle claque. */
        a.style.maxHeight = a.scrollHeight + "px";
        void a.offsetHeight;
        a.style.maxHeight = "0px";
        a._faqT = setTimeout(() => a.classList.remove("is-closing"), 520);
      }
      refresh();
    });
  });
}

/* ------------------------------ BOOT ------------------------------ */
window.BC = { reveal, magnetic, refresh, media: hydrateMedia, split, scramble, initKinetics, faq, get lenis() { return lenis; }, get velocity() { return velocity; } };
mountNav();
mountFooter();
initSmooth();
initCursor();
hydrateMedia(document);   // hydrate menu/footer bg video etc.
magnetic(document);

export const BC = window.BC;
