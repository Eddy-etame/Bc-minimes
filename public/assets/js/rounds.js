/* =====================================================================
   MINIMES · rounds.js — the fight spine
   A fixed judge's-SCORECARD HUD that tracks which "round" (section) you're
   in as you scroll, + an opt-in boxing BELL on round change.
   (Portet uses a whoosh; a bell fits Minimes.) Injected, no markup needed.
   ===================================================================== */
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initRounds() {
  const sections = document.querySelectorAll("[data-round]");
  if (!sections.length) return;

  /* ⚠ PAS d'aria-hidden sur le conteneur : il enveloppe un bouton focusable
     (le son), donc le clavier entrait dedans pendant qu'on affirmait à l'AT
     que le sous-arbre n'existait pas — WCAG 4.1.2. Seul le DÉCOR est masqué ;
     le bouton reste exposé, avec son état (§5.6 : le son opt-in doit être
     trouvable). */
  const hud = document.createElement("aside");
  hud.className = "hud"; hud.id = "hud";
  hud.setAttribute("aria-label", "Scorecard — round en cours");
  hud.innerHTML =
    `<div class="hud__top" aria-hidden="true"><span class="hud__label">Round</span><span class="hud__num">01</span></div>` +
    `<span class="hud__name" aria-hidden="true">—</span>` +
    /* le nombre de ticks SUIT les sections : hardcoder 7 marchait aujourd'hui
       et se désynchronisait au prochain [data-round] ajouté */
    `<div class="hud__ticks" aria-hidden="true">${Array.from({ length: sections.length }, () => "<i></i>").join("")}</div>` +
    `<button class="hud__sound" type="button" aria-pressed="false" aria-label="Activer le son de cloche" title="Cloche">` +
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>` +
    `</button>`;
  document.body.appendChild(hud);

  const numEl = hud.querySelector(".hud__num");
  const nameEl = hud.querySelector(".hud__name");
  const ticks = hud.querySelectorAll(".hud__ticks i");
  const soundBtn = hud.querySelector(".hud__sound");

  let current = 0, soundOn = false, actx = null;
  const bell = () => {
    if (!soundOn || !actx) return;
    try {
      const t = actx.currentTime;
      const o = actx.createOscillator(), o2 = actx.createOscillator(), g = actx.createGain();
      o.type = "sine"; o2.type = "sine";
      o.frequency.setValueAtTime(1180, t); o.frequency.exponentialRampToValueAtTime(720, t + 0.6);
      o2.frequency.setValueAtTime(1770, t); o2.frequency.exponentialRampToValueAtTime(1080, t + 0.6);
      const g2 = actx.createGain(); g2.gain.value = 0.35;
      o.connect(g); o2.connect(g2); g2.connect(g); g.connect(actx.destination);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.16, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
      o.start(t); o2.start(t); o.stop(t + 1.1); o2.stop(t + 1.1);
    } catch (e) {}
  };
  soundBtn.addEventListener("click", (e) => {
    e.preventDefault();
    soundOn = !soundOn;
    hud.classList.toggle("sound-on", soundOn);
    soundBtn.setAttribute("aria-label", soundOn ? "Couper le son de cloche" : "Activer le son de cloche");
    soundBtn.setAttribute("aria-pressed", String(soundOn));
    if (soundOn) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); } catch (e2) {} bell(); }
  });

  /* Le compteur du héros ("Round 01/07") : il était ÉCRIT EN DUR dans le HTML
     et ne bougeait jamais — un chiffre qui se présente comme vivant et qui
     ment. Il est désormais piloté par la même géométrie que la scorecard, et
     son total est DÉRIVÉ de sections.length (hardcoder 07 se désynchronisait
     au prochain [data-round] ajouté — la même erreur que les ticks évitaient
     déjà plus haut). */
  const heroNum = document.getElementById("hero-round-n");
  const heroTot = document.getElementById("hero-round-t");
  if (heroTot) heroTot.textContent = "/" + String(sections.length).padStart(2, "0");

  const setRound = (n, name) => {
    if (n === current) return;
    const advancing = n > current;
    current = n;
    numEl.textContent = String(n).padStart(2, "0");
    if (heroNum) heroNum.textContent = String(n).padStart(2, "0");
    nameEl.textContent = name || "";
    ticks.forEach((t, i) => t.classList.toggle("on", i < n));
    if (!reduce) gsap.fromTo(hud, { scale: 0.94 }, { scale: 1, duration: 0.45, ease: "back.out(2.2)" });
    if (advancing) bell();
  };

  // Track the active round from LIVE geometry (immune to ScrollTrigger
  // refresh-timing / pin-resize issues). The current round = the last
  // section whose top has scrolled above the 42% line.
  const list = [...sections].map((el) => ({ el, r: +el.dataset.round, name: el.dataset.roundName }));
  const heroEl = document.querySelector(".hero");
  let ticking = false;
  const measure = () => {
    ticking = false;
    const line = window.innerHeight * 0.42;
    let active = null;
    for (const s of list) if (s.el.getBoundingClientRect().top <= line) active = s;
    if (active) setRound(active.r, active.name);
    /* remonté dans le héros : aucune section n'a franchi la ligne. Sans ce
       repli, le compteur restait figé sur le dernier round atteint alors que
       le visiteur est revenu au premier — il faut qu'il redescende à 01. */
    else if (list.length) setRound(list[0].r, list[0].name);
    if (heroEl) hud.classList.toggle("is-on", heroEl.getBoundingClientRect().bottom < window.innerHeight * 0.5);
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(measure); } };
  if (window.BC && window.BC.lenis) window.BC.lenis.on("scroll", onScroll);
  else window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  measure();
}
