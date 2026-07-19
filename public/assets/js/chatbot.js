/* =====================================================================
   L'ASSISTANT DU BERCEAU — widget conversationnel + capture de contacts.
   Boxing Center Minimes.

   Philosophie (≠ formulaire) : le bot se présente, demande le prénom,
   puis RÉPOND. Il comprend le langage naturel via /api/chat (ancré sur
   les vraies données de la salle) et capte AU VOL les coordonnées quand
   le visiteur les donne — sans jamais l'interroger de force.

   Progressive enhancement : la pastille `.chatbot` reste un lien tel:
   dans le HTML. Ce fichier la PROMEUT en lanceur de conversation. Si le
   script ne se charge pas, elle appelle la salle comme avant — jamais un
   bouton mort.

   Accessibilité : dialog modal, focus piégé, Échap ferme, aria-live sur
   le fil, respect de prefers-reduced-motion (l'animation d'ouverture est
   coupée en CSS, la frappe simulée est raccourcie ici).
   ===================================================================== */
import { SALLE, NETWORK } from "./data.js?v=b9";

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
/* numéro FR : +33 ou 0, puis 9 chiffres groupés librement */
const PHONE_RE = /(?:\+33|0)\s?[1-9](?:[\s.\-]?\d{2}){4}/;
/* « je m'appelle X », « moi c'est X », « mon prénom est X »… Déclencheurs
   SPÉCIFIQUES : pas de « c'est » nu, qui capterait « c'est ouvert ». */
const NAME_RE = /(?:je m['’ ]?appelle|moi c['’ ]?est|mon nom est|mon pr[ée]nom (?:est|c['’ ]?est)|je me nomme|c['’ ]est\s+moi)\s+([a-zà-öø-ÿ][a-zà-öø-ÿ'’-]+)/i;
const STOP_NAMES = /^(bonjour|salut|coucou|hello|merci|oui|non|ok|d['’]accord|bien|super|cool|pas|ouvert|ferm[ée]?|combien|quoi|rien|voir|bof|jsp|ouais|nan|hey|yo)$/i;

const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
const LOGO = "/assets/img/logo.png";
const SALLES = [SALLE.short, ...NETWORK.map((n) => n.name)];

const QUICKS = [
  { label: "Essai 10€", q: "Comment se passe la séance d'essai ?" },
  { label: "Tarifs", q: "Quels sont les tarifs ?" },
  { label: "Horaires", q: "Quels sont les horaires ?" },
  { label: "Les cours", q: "Quelles disciplines proposez-vous ?" },
  { label: "Dès 3 ans", q: "Vous avez des cours pour les enfants ?" },
];

const delay = (ms) => new Promise((r) => setTimeout(r, REDUCE ? Math.min(ms, 120) : ms));
const titleCase = (s) => s.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function sessionId() {
  try {
    let id = sessionStorage.getItem("bcm-chat");
    if (!id) { id = (crypto.randomUUID?.() || String(Math.random()).slice(2)); sessionStorage.setItem("bcm-chat", id); }
    return id;
  } catch { return String(Math.random()).slice(2); }
}

/* ---------- réseau ---------- */
async function askAi(message, history, context) {
  const r = await fetch("/api/chat", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, context }),
  });
  if (!r.ok) throw new Error("chat " + r.status);
  const j = await r.json();
  if (!j.reply) throw new Error("chat vide");
  return j.reply;
}
function submitLead(payload) {
  return fetch("/api/lead", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, page: location.pathname }),
  });
}
/* Repli si /api/chat est injoignable (dev statique, réseau coupé) : la
   salle répond quand même. Volontairement court — la vraie base de
   connaissance vit côté serveur, dans api/chat.js. */
function offlineAnswer() {
  return `Je n'arrive pas à joindre le club à l'instant. Appelle la salle au ${SALLE.phone}, ou passe au ${SALLE.address.full} — du lundi au samedi, ${SALLE.hours.replace(/^Lun – Sam · /, "")}.`;
}

export function initChatbot() {
  const launcher = document.querySelector("a.chatbot, button.chatbot");
  if (!launcher || document.getElementById("bcm-chat")) return;

  const sid = sessionId();
  const profile = { prenom: "", nom: "", email: "", phone: "", salle: SALLE.short };
  const history = [];
  let opened = false, typing = false, exchanges = 0;
  let nudged = false;      // l'invitation douce a-t-elle déjà été faite ?
  let expectName = false;  // le bot vient de demander le prénom
  let leadSig = "";        // signature du dernier lead envoyé (anti-doublon)
  let callbackAsked = false;
  let lastFocus = null;

  /* ---------- l'habillage ----------
     La feuille du panneau ne vit plus dans base.css : elle ne servait
     qu'ici, et base.css bloque le rendu des 8 pages. On la pose dès que
     le module s'exécute — c'est-à-dire à l'INTENTION de parler, avant
     tout affichage. `open()` attend qu'elle soit appliquée : le panneau
     ne peut donc pas apparaître nu une seule image. */
  const feuille = new Promise((resolu) => {
    const dejaLa = document.querySelector('link[data-bcm-chat-css]');
    if (dejaLa) return resolu();
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "/assets/css/chatbot.css?v=b9";
    l.setAttribute("data-bcm-chat-css", "");
    /* résolu dans les deux cas : une feuille manquante ne doit jamais
       retenir le panneau prisonnier — mieux vaut brut que rien. */
    l.addEventListener("load", () => resolu(), { once: true });
    l.addEventListener("error", () => resolu(), { once: true });
    document.head.appendChild(l);
  });

  /* ---------- l'échafaudage ---------- */
  const root = document.createElement("div");
  root.className = "bcm-chat";
  root.id = "bcm-chat";
  root.hidden = true;
  root.innerHTML = `
    <section class="bcm-chat__panel" role="dialog" aria-modal="true" aria-labelledby="bcm-chat-title">
      <header class="bcm-chat__head">
        <img src="${LOGO}" alt="" width="342" height="160" decoding="async" />
        <div class="bcm-chat__head-text">
          <strong id="bcm-chat-title">Boxing Center Minimes</strong>
          <span class="bcm-chat__status">L'assistant du club</span>
        </div>
        <button type="button" class="bcm-chat__close" aria-label="Fermer l'assistant">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
      </header>
      <div class="bcm-chat__log" role="log" aria-live="polite" aria-relevant="additions text"></div>
      <div class="bcm-chat__chips" hidden></div>
      <form class="bcm-chat__form">
        <input type="text" autocomplete="off" aria-label="Ton message" placeholder="Écris ta question…" />
        <button class="bcm-chat__send" type="submit" aria-label="Envoyer">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h14M14 6l6 6-6 6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </form>
    </section>`;
  document.body.appendChild(root);

  const panel = root.querySelector(".bcm-chat__panel");
  const logEl = root.querySelector(".bcm-chat__log");
  const chipsEl = root.querySelector(".bcm-chat__chips");
  const form = root.querySelector(".bcm-chat__form");
  const input = form.querySelector("input");
  const sendBtn = form.querySelector(".bcm-chat__send");
  const closeBtn = root.querySelector(".bcm-chat__close");

  /* ---------- rendu ---------- */
  const msgs = [];
  function render() {
    logEl.innerHTML = msgs.map((m) => `
      <div class="bcm-chat__msg bcm-chat__msg--${m.role}">
        ${m.role === "bot" ? `<img src="${LOGO}" alt="" width="342" height="160" decoding="async" />` : ""}
        <div class="bcm-chat__bubble">${esc(m.text)}</div>
      </div>`).join("") + (typing ? `
      <div class="bcm-chat__msg bcm-chat__msg--bot">
        <img src="${LOGO}" alt="" width="342" height="160" decoding="async" />
        <div class="bcm-chat__bubble"><span class="bcm-chat__dots" aria-label="L'assistant écrit"><i></i><i></i><i></i></span></div>
      </div>` : "");
    logEl.scrollTop = logEl.scrollHeight;
  }
  async function botSay(text, pause = 550) {
    typing = true; sendBtn.disabled = true; render();
    await delay(pause);
    typing = false; sendBtn.disabled = false;
    msgs.push({ role: "bot", text }); render();
  }
  function userSay(text) { msgs.push({ role: "user", text }); render(); }

  function showChips() {
    chipsEl.innerHTML = QUICKS.map((q) => `<button type="button" data-q="${q.q.replace(/"/g, "&quot;")}">${q.label}</button>`).join("")
      + `<button type="button" data-callback>Être rappelé</button>`;
    chipsEl.hidden = false;
  }
  const hideChips = () => { chipsEl.hidden = true; chipsEl.innerHTML = ""; };

  /* ---------- capture au fil de l'eau ---------- */
  function contextString() {
    const b = [];
    if (profile.prenom) b.push(`Prénom : ${profile.prenom}`);
    if (profile.salle) b.push(`Salle : ${profile.salle}`);
    if (profile.email) b.push("Email déjà donné");
    if (profile.phone) b.push("Téléphone déjà donné");
    return b.join(". ");
  }
  function maybeSubmitLead(event) {
    if (!profile.email && !profile.phone) return false; // rien pour recontacter
    const sig = JSON.stringify(profile);
    if (sig === leadSig) return false;                  // déjà parti à l'identique
    leadSig = sig;
    submitLead({
      event, sessionId: sid,
      prenom: profile.prenom, nom: profile.nom,
      name: [profile.prenom, profile.nom].filter(Boolean).join(" ").trim(),
      email: profile.email, phone: profile.phone, salle: profile.salle,
    }).catch(() => { /* silencieux : ne bloque jamais la conversation */ });
    return true;
  }
  /** Extrait prénom / email / téléphone / salle. true si du neuf est capté. */
  function extract(text) {
    let found = false;
    const email = text.match(EMAIL_RE);
    if (email && !profile.email) { profile.email = email[0]; found = true; }
    const phone = text.match(PHONE_RE);
    if (phone && !profile.phone) { profile.phone = phone[0].replace(/\s+/g, " ").trim(); found = true; }
    const salle = SALLES.find((s) => new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text));
    if (salle && salle !== profile.salle) { profile.salle = salle; found = true; }
    if (!profile.prenom) {
      let name = text.match(NAME_RE)?.[1]?.trim();
      if (!name && expectName) {
        // le bot vient de demander le prénom : un mot simple suffit
        const w = text.trim().replace(/[!.,;:?]+$/, "").split(/\s+/)[0];
        if (w && !EMAIL_RE.test(w) && !/\d/.test(w) && !STOP_NAMES.test(w) && w.length > 1) name = w;
      }
      if (name && !STOP_NAMES.test(name)) { profile.prenom = titleCase(name.split(/\s+/)[0]); found = true; }
    }
    expectName = false;
    return found;
  }

  /* ---------- la conversation ---------- */
  async function answer(text) {
    const gotNew = extract(text);
    const sent = gotNew ? maybeSubmitLead(callbackAsked ? "callback_request" : "lead_collected") : false;

    hideChips();
    let reply;
    try { reply = await askAi(text, history.slice(-6), contextString()); }
    catch { reply = offlineAnswer(); }
    history.push({ role: "user", content: text }, { role: "assistant", content: reply });
    await botSay(reply);
    exchanges++;

    if (sent && callbackAsked) {
      callbackAsked = false;
      await botSay(`C'est noté${profile.prenom ? `, ${profile.prenom}` : ""} — je transmets à Mehdi, un coach te rappelle.`, 450);
    } else if (!nudged && exchanges >= 2 && !profile.email && !profile.phone) {
      nudged = true;
      await botSay("Au fait — si tu veux qu'un coach te rappelle ou t'envoie le planning, laisse-moi ton prénom et un numéro ou un email. Quand tu veux, pas d'obligation.", 450);
    }
    showChips();
  }

  async function startCallback() {
    callbackAsked = true;
    hideChips();
    if (profile.email || profile.phone) {
      maybeSubmitLead("callback_request");
      await botSay(`Ça marche${profile.prenom ? `, ${profile.prenom}` : ""} — je transmets, un coach te rappelle. En attendant, une question sur la salle ?`);
      callbackAsked = false;
      showChips();
      return;
    }
    expectName = !profile.prenom;
    await botSay(profile.prenom
      ? `Avec plaisir ${profile.prenom} — laisse-moi un numéro ou un email et un coach te rappelle.`
      : "Avec plaisir — dis-moi ton prénom et un numéro (ou un email), et un coach te rappelle.");
    input.placeholder = "Ton prénom et ton numéro…";
    input.focus();
  }

  /* ---------- ouverture / fermeture, focus piégé ---------- */
  const FOCUSABLE = 'button:not([disabled]), input, a[href], [tabindex]:not([tabindex="-1"])';
  function trap(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key !== "Tab") return;
    const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  async function open() {
    lastFocus = document.activeElement;
    await feuille;              // jamais de panneau nu, pas une image
    root.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    document.addEventListener("keydown", trap, true);
    input.focus();
    if (!opened) {
      opened = true;
      await botSay(`Salut ! Ici l'assistant du Boxing Center Minimes — la salle historique, ${SALLE.address.street}. Je réponds sur les horaires, les cours, les tarifs, l'école dès 3 ans…`, 500);
      expectName = true;
      await botSay("Avant qu'on commence : tu t'appelles comment ?", 400);
      showChips();
    }
  }
  function close() {
    root.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    document.removeEventListener("keydown", trap, true);
    lastFocus?.focus?.();
  }

  /* ---------- promotion de la pastille ---------- */
  launcher.setAttribute("role", "button");
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "bcm-chat");
  launcher.setAttribute("aria-label", "Ouvrir l'assistant du Boxing Center Minimes");
  const label = launcher.querySelector(".chatbot__label");
  if (label) label.textContent = "Parler au club";
  launcher.addEventListener("click", (e) => {
    e.preventDefault();                       // le tel: reste le repli sans JS
    root.hidden ? void open() : close();
  });

  /* ---------- événements ---------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || typing) return;
    input.value = "";
    input.placeholder = "Écris ta question…";
    userSay(text);
    await answer(text);
  });
  chipsEl.addEventListener("click", async (e) => {
    if (e.target.closest("button[data-callback]")) return void startCallback();
    const b = e.target.closest("button[data-q]");
    if (b) { const t = b.dataset.q; userSay(t); await answer(t); }
  });
  closeBtn.addEventListener("click", close);
}

initChatbot();
