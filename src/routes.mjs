/* =====================================================================
   Les routes indexables, en un seul endroit.

   Le sitemap ET le robots.txt sont fabriqués au build à partir de cette
   table : plus de date recopiée à la main dans un fichier inerte, plus
   de risque qu'une page nouvelle existe sans être déclarée, et le
   <lastmod> se remet à jour tout seul à chaque publication.

   Une page qui ne doit pas être indexée n'est PAS dans cette liste —
   /admin/ (le backoffice) et /api/ sont refusés en clair dans robots.txt,
   en plus du meta robots de la page et de l'en-tête X-Robots-Tag.
   ===================================================================== */

export const SITE = "https://minimes.boxingcenter.fr";

export const ROUTES = [
  {
    path: "/",
    priority: "1.0",
    changefreq: "weekly",
    image: "/assets/img/bc/anglaise-1.webp",
    caption: "Boxe anglaise — sur le ring, Boxing Center Minimes",
  },
  {
    path: "/activites/",
    priority: "0.8",
    changefreq: "monthly",
    image: "/assets/img/bc/training-2.webp",
    caption: "Travail technique aux pattes d'ours — Boxing Center",
  },
  {
    path: "/le-club/",
    priority: "0.8",
    changefreq: "monthly",
    image: "/assets/img/bc/salle-1.webp",
    caption: "La salle historique — entre les cordes, Boxing Center",
  },
  {
    path: "/coachs/",
    priority: "0.8",
    changefreq: "monthly",
    image: "/assets/img/bc/cutouts/coach-mehdi.webp",
    caption: "Mehdi B., coach principal de Boxing Center Minimes",
  },
  {
    path: "/galerie/",
    priority: "0.8",
    changefreq: "monthly",
    image: "/assets/img/bc/levels-1.webp",
    caption: "Tous les niveaux — la galerie Boxing Center",
  },
  {
    path: "/plannings/",
    priority: "0.8",
    changefreq: "weekly",
    image: "/assets/img/bc/planning-2026.webp",
    caption: "Planning des cours — salle des Minimes, Barrière de Paris",
  },
  {
    path: "/tarifs/",
    priority: "0.8",
    changefreq: "monthly",
    image: "/assets/img/bc/cross-1.webp",
    caption: "Cross training — Boxing Center",
  },
  {
    path: "/contact/",
    priority: "0.8",
    changefreq: "monthly",
    image: "/assets/img/bc/training-1.webp",
    caption: "Cardio boxing — Boxing Center",
  },
];

/** Date du build, au format ISO court — jamais un millésime écrit à la main. */
export const BUILT = new Date().toISOString().slice(0, 10);
