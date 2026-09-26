/* =====================================================================
   MINIMES · scripts/lastmod.mjs — la vraie date de chaque page

   LE DÉFAUT. Le plan du site datait les neuf pages du jour du build
   (`BUILT = new Date()`). Une page qui n'a pas changé depuis juillet
   passait pour modifiée à chaque déploiement : c'est exactement la
   fausse fraîcheur qui apprend aux moteurs à ignorer <lastmod>.

   CE QUE FAIT CE SCRIPT. Pour chaque route, la date du dernier commit
   qui a touché sa page ou l'une des données qu'elle affiche (data*.js,
   routes.mjs). Une modification pas encore commitée compte pour
   aujourd'hui : elle est sur le point de partir. Le résultat est écrit
   dans src/lastmod.json et COMMITÉ : sur Vercel, le clone est superficiel
   (shallow) et tout fichier paraîtrait créé au dernier commit — là, on
   garde le fichier commité sans le réécrire.

   Usage : `npm run prebuild` (avant avis-google.mjs).
   ===================================================================== */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src", "lastmod.json");

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

try {
  if (git(["rev-parse", "--is-shallow-repository"]) === "true") {
    console.log("[lastmod] clone superficiel : le fichier commité est conservé.");
    process.exit(0);
  }
} catch {
  console.log("[lastmod] git indisponible : le fichier commité est conservé.");
  process.exit(0);
}

const jour = (v) => new Date(v).toISOString().slice(0, 10);
const aujourdhui = jour(Date.now());

function dateDe(rel) {
  if (!existsSync(join(ROOT, rel))) return null;
  if (git(["status", "--porcelain", "--", rel])) return aujourdhui;
  const c = git(["log", "-1", "--format=%cI", "--", rel]);
  return c ? jour(c) : null;
}
const laPlusRecente = (dates) => dates.filter(Boolean).sort().pop() || aujourdhui;

/* Les données que toutes les pages affichent : un changement les re-date toutes. */
const DONNEES = [
  ...readdirSync(join(ROOT, "public/assets/js")).filter((f) => /^data.*\.js$/.test(f)).map((f) => "public/assets/js/" + f),
  "src/routes.mjs",
];
const dateDonnees = laPlusRecente(DONNEES.map(dateDe));

const routes = [...readFileSync(join(ROOT, "src/routes.mjs"), "utf8").matchAll(/path:\s*"([^"]+)"/g)].map((m) => m[1]);
const carte = {};
for (const path of routes) {
  const page = path === "/" ? "src/pages/index.astro" : `src/pages${path}index.astro`;
  carte[path] = laPlusRecente([dateDe(page), dateDonnees]);
}
writeFileSync(OUT, JSON.stringify(carte, null, 2) + "\n");
console.log(`[lastmod] ${routes.length} routes datées, la plus récente ${laPlusRecente(Object.values(carte))}`);
