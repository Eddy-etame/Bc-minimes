/* =====================================================================
   LE MUR DU CLUB — la galerie que les gens remplissent eux-mêmes.
   Boxing Center Minimes.

   Ce que ça fait, dans l'ordre :
     1. le visiteur choisit une photo ou une vidéo de la salle ;
     2. on VÉRIFIE vraiment le fichier (octets d'en-tête + décodage réel,
        pas l'extension : un .jpg peut être n'importe quoi) ;
     3. le serveur valide le prénom, le contact et la limite par IP, puis
        SIGNE un dépôt direct vers Cloudinary — les octets ne passent
        jamais par la fonction Vercel ;
     4. le fichier atterrit tagué "pending" : personne ne le voit ;
     5. le staff approuve depuis Le coin bleu, et alors seulement il
        apparaît sur cette page ;
     6. le prénom + le contact partent dans LE CARNET EXISTANT
        (/api/lead, event "upload_contributor") — un seul carnet, pas deux.

   PERF : ce module et sa feuille ne descendent QUE lorsque la section
   entre à l'écran (cf. galerie.js). Les médias approuvés sont chargés
   paresseusement, et une vidéo n'est jamais téléchargée au premier rendu
   — on ne sert que son affiche.
   ===================================================================== */

const API = "";                    // même origine : /api/...
let LIMITS = { maxMb: 60, maxSec: 15 };

/* Le même filtre que le serveur — première ligne, pas la dernière. */
const BADWORDS = [
  "merde", "putain", "connard", "connasse", "salope", "encule", "enculé", "pute", "bite", "couille",
  "nique", "niquer", "ntm", "pd", "pédé", "tapette", "bougnoule", "negro", "nègre", "youpin", "salaud",
  "fuck", "shit", "bitch", "cunt", "nigger", "faggot", "whore", "rape", "nazi", "kys", "porn", "sex",
];
function inappropriate(s) {
  const norm = s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s]/g, " ");
  if (/(.)\1{6,}/.test(norm)) return true;
  if (/https?:|www\.|\.[a-z]{2,}\/?/i.test(s)) return true;
  return BADWORDS.some((w) => new RegExp(`\\b${w}`, "i").test(norm));
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------------------------------------------------------------------
   LE FICHIER EST-IL CE QU'IL PRÉTEND ÊTRE ?
   On lit les premiers octets. L'extension et le type déclaré par le
   navigateur se falsifient en trois secondes ; la signature du format,
   non. Ce qui n'est pas reconnu est refusé — on ne devine pas.
   --------------------------------------------------------------------- */
async function sniff(file) {
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const ascii = (a, b) => String.fromCharCode(...head.slice(a, b));
  const is = (...bytes) => bytes.every((v, i) => head[i] === v);

  if (is(0xff, 0xd8, 0xff)) return { kind: "image", fmt: "jpeg" };
  if (is(0x89, 0x50, 0x4e, 0x47)) return { kind: "image", fmt: "png" };
  if (ascii(0, 3) === "GIF") return { kind: "image", fmt: "gif" };
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { kind: "image", fmt: "webp" };
  if (is(0x1a, 0x45, 0xdf, 0xa3)) return { kind: "video", fmt: "webm" };
  if (ascii(4, 8) === "ftyp") {
    const brand = ascii(8, 12).toLowerCase();
    /* HEIC/HEIF sont des images malgré le conteneur ISO-BMFF partagé */
    if (/^(heic|heix|hevc|mif1|msf1|heim)/.test(brand)) return { kind: "image", fmt: "heic" };
    return { kind: "video", fmt: "mp4" };
  }
  return null;
}

/** Décodage RÉEL de l'image : si le navigateur n'arrive pas à la décoder,
 *  ce n'est pas une image, quoi qu'en dise l'en-tête. */
function decodeImage(file) {
  if (!("createImageBitmap" in window)) return Promise.resolve(true);   // navigateur ancien : Cloudinary tranchera
  return createImageBitmap(file).then((b) => { b.close?.(); return true; }, () => false);
}

/** Métadonnées vidéo : durée réelle + une piste image qui existe. */
function videoMeta(file) {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    const url = URL.createObjectURL(file);
    const done = (r) => { URL.revokeObjectURL(url); resolve(r); };
    v.preload = "metadata";
    v.onloadedmetadata = () => done({ ok: v.videoWidth > 0, duration: v.duration || 0 });
    v.onerror = () => done({ ok: false, duration: 0 });
    setTimeout(() => done({ ok: false, duration: 0 }), 8000);
    v.src = url;
  });
}

/* --------------------------------------------------------------------- */
export async function initCommunity() {
  const root = document.getElementById("community");
  if (!root) return;
  const grid = root.querySelector("#community-grid");
  const form = root.querySelector("#community-form");
  const status = root.querySelector("#community-status");
  if (!grid || !form || !status) return;

  bindForm(form, status);
  await loadItems(grid, form);
}

function say(el, msg, kind) { el.textContent = msg; el.dataset.kind = kind; }

async function loadItems(grid, form) {
  try {
    const r = await fetch(`${API}/api/community/items`);
    if (!r.ok) throw new Error();
    const { items, limits } = await r.json();
    if (limits) LIMITS = limits;
    const hint = form.querySelector(".cm-hint");
    if (hint) hint.textContent = `Photo ou vidéo · ${LIMITS.maxMb} Mo max · ${LIMITS.maxSec} s max pour une vidéo · validée par le staff avant publication`;

    if (!items?.length) {
      grid.innerHTML = `<p class="cm-empty">Le mur est vide. Sois le premier à l'accrocher — une photo du ring, un round au sac, ce que tu veux.</p>`;
      return;
    }
    grid.innerHTML = items.map(cell).join("");
    armVideos(grid);
  } catch {
    grid.innerHTML = `<p class="cm-empty">Le mur du club ouvre très bientôt. Repasse.</p>`;
  }
}

/* Une vidéo n'est JAMAIS téléchargée au premier rendu : on ne pose que son
   affiche (une image), et `preload="none"`. Les octets ne partent qu'au
   moment où la vignette entre à l'écran — et la lecture, au survol. */
function cell(it) {
  const legend = `${esc(it.title || "Le club")}${it.author ? ` · ${esc(it.author)}` : ""}`;
  if (it.kind === "video") {
    return `<figure class="cm-item cm-item--video">
      <video src="${esc(it.src)}" poster="${esc(it.poster)}" muted loop playsinline preload="none"></video>
      <span class="cm-play" aria-hidden="true">▶</span>
      <figcaption class="cm-cap">${legend}</figcaption>
    </figure>`;
  }
  return `<figure class="cm-item">
    <img src="${esc(it.src)}" alt="${legend}" loading="lazy" decoding="async" />
    <figcaption class="cm-cap">${legend}</figcaption>
  </figure>`;
}

function armVideos(grid) {
  const vids = [...grid.querySelectorAll("video")];
  if (!vids.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) { if (v.preload === "none") v.preload = "metadata"; }
      else v.pause();
    });
  }, { threshold: 0.1, rootMargin: "80px" });
  vids.forEach((v) => {
    io.observe(v);
    const fig = v.closest(".cm-item");
    fig.addEventListener("pointerenter", () => { v.preload = "auto"; v.play().catch(() => {}); });
    fig.addEventListener("pointerleave", () => v.pause());
  });
}

/* --------------------------------------------------------------------- */
function bindForm(form, status) {
  const fileInput = form.querySelector('input[type="file"]');
  const submit = form.querySelector('button[type="submit"]');
  const bar = form.querySelector(".cm-bar > i");
  const val = (n) => (form.querySelector(`[name="${n}"]`)?.value || "").trim();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const author = val("author"), email = val("email"), phone = val("phone"), title = val("title");

    if (author.length < 2) return say(status, "Ton prénom d'abord — on veut savoir qui a filmé.", "err");
    if (inappropriate(author)) return say(status, "Ce prénom ne passe pas. Mets le vrai.", "err");
    if (title && inappropriate(title)) return say(status, "Ce titre ne passe pas. Trouve autre chose.", "err");

    const emailOk = /^[^@\s]+@[^@\s.]+\.[a-z]{2,}$/i.test(email);
    const phoneOk = /^(?:\+33|0)\s?[1-9](?:[\s.\-]?\d{2}){4}$/.test(phone);
    if (!emailOk && !phoneOk)
      return say(status, "Laisse un email ou un numéro — sinon on ne peut pas te prévenir quand ça passe en ligne.", "err");

    const file = fileInput.files?.[0];
    if (!file) return say(status, "Choisis une photo ou une vidéo.", "err");
    if (file.size > LIMITS.maxMb * 1024 * 1024)
      return say(status, `Trop lourd : ${Math.round(file.size / 1048576)} Mo pour ${LIMITS.maxMb} Mo autorisés.`, "err");

    say(status, "On regarde le fichier…", "info");
    const sig = await sniff(file);
    if (!sig) return say(status, "Ce fichier n'est ni une photo ni une vidéo. Reprends-en un vrai.", "err");
    /* le type ANNONCÉ doit coller au type RÉEL */
    if (file.type && !file.type.startsWith(sig.kind + "/"))
      return say(status, "Ce fichier n'est pas ce qu'il prétend être. Refusé.", "err");

    if (sig.kind === "image") {
      if (!(await decodeImage(file)))
        return say(status, "Cette image est illisible — elle est abîmée, ou ce n'en est pas une.", "err");
    } else {
      const m = await videoMeta(file);
      if (!m.ok) return say(status, "Cette vidéo est illisible. Réessaie avec un autre fichier.", "err");
      if (m.duration > LIMITS.maxSec + 0.5)
        return say(status, `Trop longue : ${Math.round(m.duration)} s pour ${LIMITS.maxSec} s autorisées. Coupe au meilleur moment.`, "err");
    }

    submit.disabled = true;
    say(status, "Préparation…", "info");
    try {
      /* 1) notre fonction valide, limite, et signe */
      const signRes = await fetch(`${API}/api/community/sign`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, email, phone, title, kind: sig.kind }),
      });
      const sign = await signRes.json().catch(() => ({}));
      if (!signRes.ok) { submit.disabled = false; return say(status, sign.error || "Envoi refusé.", "err"); }

      /* 2) le fichier part DIRECTEMENT chez Cloudinary */
      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", sign.apiKey);
      fd.append("timestamp", String(sign.timestamp));
      fd.append("folder", sign.folder);
      fd.append("tags", sign.tags);
      fd.append("context", sign.context);
      if (sign.moderation) fd.append("moderation", sign.moderation);
      fd.append("signature", sign.signature);

      say(status, "Envoi en cours…", "info");
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${sign.cloudName}/${sig.kind}/upload`);
      xhr.upload.onprogress = (ev) => {
        if (bar && ev.lengthComputable) bar.style.width = `${Math.round((ev.loaded / ev.total) * 100)}%`;
      };
      xhr.onload = () => {
        submit.disabled = false;
        if (bar) bar.style.width = "0%";
        if (xhr.status >= 200 && xhr.status < 300) {
          /* 3) LE CARNET — le même que celui de l'assistant, pas un second */
          fetch(`${API}/api/lead`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "upload_contributor", prenom: author, name: author,
              email: emailOk ? email : "", phone: phoneOk ? phone : "",
              salle: "Minimes", page: location.pathname,
            }),
          }).catch(() => { /* le dépôt est fait : le carnet ne doit jamais le casser */ });
          say(status, `Reçu, ${author}. Un coach regarde, et si c'est bon ça monte sur le mur — on te prévient.`, "ok");
          form.reset();
        } else {
          say(status, "L'envoi a échoué. Réessaie dans un instant.", "err");
        }
      };
      xhr.onerror = () => {
        submit.disabled = false;
        if (bar) bar.style.width = "0%";
        say(status, "Service indisponible pour le moment.", "err");
      };
      xhr.send(fd);
    } catch {
      submit.disabled = false;
      say(status, "Service indisponible pour le moment.", "err");
    }
  });
}
