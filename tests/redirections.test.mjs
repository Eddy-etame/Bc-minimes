import test from "node:test";
import assert from "node:assert/strict";
import middleware, { config } from "../middleware.js";

/* Le contrat de middleware.js, joué sans Vercel : une page = une adresse.
   Le matcher est reproduit tel que Vercel le lit (path-to-regexp), pour
   vérifier aussi ce que le middleware ne voit JAMAIS — l'API du chatbot,
   les fichiers à extension, le backoffice. */

const appel = (url) => middleware(new Request(url));

function voit(chemin) {
  const [pages, racine, imbrique] = config.matcher;
  return (
    new RegExp(`^${pages}$`).test(chemin) ||
    chemin === racine ||
    new RegExp(`^${imbrique.replace("/:chemin*", "(?:/.+)?")}$`).test(chemin)
  );
}

test("domaine canonique : la barre finale, une seule fois", () => {
  for (const [demande, attendu] of [
    ["https://boxe-toulouse.com/tarifs", "https://boxe-toulouse.com/tarifs/"],
    ["https://boxe-toulouse.com/le-club", "https://boxe-toulouse.com/le-club/"],
    ["https://boxe-toulouse.com/plannings?disc=boxe", "https://boxe-toulouse.com/plannings/?disc=boxe"],
    ["https://boxe-toulouse.com/index.html", "https://boxe-toulouse.com/"],
    ["https://boxe-toulouse.com/tarifs/index.html", "https://boxe-toulouse.com/tarifs/"],
  ]) {
    const r = appel(demande);
    assert.equal(r?.status, 308, demande);
    assert.equal(r.headers.get("location"), attendu, demande);
    assert.equal(r.headers.get("x-robots-tag"), null, `${demande} : la redirection du domaine canonique n'est pas un noindex`);
  }
});

test("domaine canonique : les adresses justes passent sans détour", () => {
  for (const url of [
    "https://boxe-toulouse.com/",
    "https://boxe-toulouse.com/tarifs/",
    "https://boxe-toulouse.com/plannings/?disc=boxe",
    "https://boxe-toulouse.com/mentions-legales/",
  ]) {
    assert.equal(appel(url), undefined, url);
  }
});

test("domaine technique et www : tout part vers boxe-toulouse.com", () => {
  for (const [demande, attendu, noindex] of [
    ["https://bc-minimes.vercel.app/", "https://boxe-toulouse.com/", true],
    ["https://bc-minimes.vercel.app/tarifs/", "https://boxe-toulouse.com/tarifs/", true],
    ["https://bc-minimes.vercel.app/tarifs", "https://boxe-toulouse.com/tarifs/", true],
    ["https://bc-minimes.vercel.app/index.html", "https://boxe-toulouse.com/", true],
    ["https://www.boxe-toulouse.com/coachs/", "https://boxe-toulouse.com/coachs/", false],
  ]) {
    const r = appel(demande);
    assert.equal(r?.status, 308, demande);
    assert.equal(r.headers.get("location"), attendu, demande);
    assert.equal(r.headers.get("x-robots-tag"), noindex ? "noindex, nofollow" : null, demande);
  }
});

test("le matcher laisse l'API, les fichiers et le backoffice tranquilles", () => {
  for (const chemin of ["/api/chat", "/api/lead", "/api/mcp", "/assets/js/site.js", "/fonts/archivo-latin.woff2",
    "/sitemap.xml", "/robots.txt", "/llms.txt", "/admin/", "/a70497773c826ddea6b89510398005ff.txt"]) {
    assert.equal(voit(chemin), false, `${chemin} ne doit pas passer par le middleware`);
  }
  for (const chemin of ["/", "/tarifs", "/tarifs/", "/plannings", "/index.html", "/le-club/index.html"]) {
    assert.equal(voit(chemin), true, `${chemin} doit passer par le middleware`);
  }
});
