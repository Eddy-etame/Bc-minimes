/* =====================================================================
   MINIMES · scripts/cuire-galerie.mjs — les photos entrent dans le HTML

   LE PROBLÈME, MESURÉ. /galerie/ servait une grille vide (`#ga-grid`), et
   la page entière ne contenait qu'UNE balise <img> — celle de la
   visionneuse, sans source. Pire que sur les salles sœurs : même APRÈS le
   JavaScript, les vignettes étaient des `<figure>` sans image, la photo
   n'arrivant qu'en fond CSS. Douze clichés, aucun indexable.

   Google Images n'indexe que ce qu'il lit dans le HTML. Et les robots des
   assistants (GPTBot, ClaudeBot, PerplexityBot) n'exécutent pas le
   JavaScript : pour eux, la galerie était une page blanche.

   CE QUE FAIT CE SCRIPT. Il écrit dans #ga-grid les MÊMES cellules que
   renderGrid() peindra ensuite — mêmes classes, mêmes data-*, mêmes alt.
   Le JS fait `box.innerHTML = …` : il réécrit par-dessus à l'identique,
   donc aucun doublon. Et hydrateMedia() a appris à passer son tour quand
   une <img> est déjà là, pour ne pas en empiler une seconde.

   Effet de bord assumé : sans JavaScript, la galerie s'affiche.

   Usage : `npm run postbuild`.
   ===================================================================== */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PAGE = join(ROOT, "dist", "galerie", "index.html");
const { GALLERY } = await import(
  pathToFileURL(join(ROOT, "public", "assets", "js", "data-galerie.js")).href
);

const cellules = GALLERY.shots
  .map((s, i) => `<figure class="ga-cell media ${s.big ? "ga-cell--big" : ""}" data-zone="${s.zone}" data-img="${s.img}" data-label="${s.label}" role="button" tabindex="0" aria-label="Agrandir : ${s.label}" style="--i:${i}"><img src="${s.img}" alt="${s.alt}" width="${s.w}" height="${s.h}" loading="lazy" decoding="async" /></figure>`)
  .join("");

const html = await readFile(PAGE, "utf8");
const creux = /(<div[^>]*id="ga-grid"[^>]*>)\s*(<\/div>)/;
if (!creux.test(html)) {
  console.error("[galerie] la grille #ga-grid n'est plus vide ou a changé de forme — rien de cuit");
  process.exit(1);
}
await writeFile(PAGE, html.replace(creux, `$1${cellules}$2`));
console.log(`[galerie] ${GALLERY.shots.length} photos cuites dans /galerie/ (lisibles sans JavaScript)`);
