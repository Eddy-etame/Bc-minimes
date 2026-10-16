/* =====================================================================
   MINIMES · middleware.js — une page, une adresse

   LE DÉFAUT, MESURÉ LE 12/10/2026 (curl, état technique du réseau).
   Chaque page des Minimes répondait 200 sous plusieurs adresses, tenues
   ensemble par la seule balise canonique :
     · tout le site sur bc-minimes.vercel.app, sans X-Robots-Tag ;
     · /tarifs, /plannings, /activites, /le-club… sans barre finale —
       club-boxe-blagnac.fr envoie 65 liens vers ces formes-là ;
     · /index.html et /<page>/index.html.
   Une canonique est un conseil que Google peut ignorer ; une 308 est un
   fait. Ramonville et Saint-Cyprien redirigent déjà.

   LA CORRECTION, CELLE DE RAMONVILLE (bc-ramonville/middleware.js).
   Les règles `redirects` de vercel.json passent avant ce fichier :
   elles renvoient le domaine technique (chemins sans barre finale) et
   les /index.html. Ce middleware ferme ce qu'elles ne voient pas :
     1. le domaine technique ou www, chemins À barre finale compris —
        `/:path*` de vercel.json ne les attrape pas (vu à Ramonville) ;
     2. sur le domaine canonique, toute page demandée sans barre finale ;
     3. /index.html, en filet si une règle de vercel.json sautait.
   La requête garde sa chaîne : /plannings?disc=boxe devient
   /plannings/?disc=boxe, qui reste servie en 200 avec X-Robots-Tag
   noindex et sa canonique (vercel.json, inchangé).

   CE QU'IL NE TOUCHE PAS (le matcher les exclut) : /api/ (le chatbot, le
   formulaire, le MCP), /assets/, /fonts/, /admin, et tout fichier à
   extension (.xml, .txt, .webp…) — sauf index.html.

   Les déploiements de prévisualisation (bc-minimes-git-….vercel.app)
   ne sont pas renvoyés : Vercel les sert déjà en noindex, et l'équipe
   s'en sert pour relire avant la mise en ligne.
   ===================================================================== */
export const config = {
  matcher: [
    "/((?!api/|assets/|fonts/|admin|.*\\.[a-zA-Z0-9]+$).*)",
    "/index.html",
    "/:chemin*/index.html",
  ],
};

const HOTE_CANONIQUE = "boxe-toulouse.com";
const HOTE_TECHNIQUE = "bc-minimes.vercel.app";

/** "/tarifs" → "/tarifs/", "/tarifs/index.html" → "/tarifs/", "/" reste "/". */
function cheminCanonique(chemin) {
  const sansIndex = chemin.replace(/(^|\/)index\.html$/, "$1");
  if (sansIndex === "" || sansIndex === "/") return "/";
  return sansIndex.endsWith("/") ? sansIndex : sansIndex + "/";
}

function redirige(url, technique = false) {
  return new Response(null, {
    status: 308,
    headers: {
      Location: url.toString(),
      "Cache-Control": "public, max-age=0, must-revalidate",
      ...(technique ? { "X-Robots-Tag": "noindex, nofollow" } : {}),
    },
  });
}

export default function middleware(request) {
  const url = new URL(request.url);

  if (url.hostname === HOTE_TECHNIQUE || url.hostname === `www.${HOTE_CANONIQUE}`) {
    const technique = url.hostname === HOTE_TECHNIQUE;
    url.hostname = HOTE_CANONIQUE;
    url.protocol = "https:";
    url.port = "";
    url.pathname = cheminCanonique(url.pathname);
    return redirige(url, technique);
  }

  if (url.hostname === HOTE_CANONIQUE && url.pathname !== cheminCanonique(url.pathname)) {
    url.pathname = cheminCanonique(url.pathname);
    return redirige(url);
  }
  /* Sinon : rien. La requête continue vers le fichier statique. */
}
