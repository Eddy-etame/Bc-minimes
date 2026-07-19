/* =====================================================================
   BOXING CENTER — MINIMES · la galerie

   Détaché de data.js pour une raison mesurée : le noyau part sur les 8
   pages (site.js en dépend), ces données-là n'en concernent que une seule page.
   Les embarquer partout coûtait leur poids sur chaque page pour rien.
   ===================================================================== */

/* =====================================================================
   LA GALERIE — pool photo RÉEL Boxing Center (servi en placeholder depuis
   le site Portet), gradé N&B par le CSS. ⚠ à remplacer par les vraies
   photos des Minimes. Les légendes décrivent l'ACTIVITÉ, jamais un claim
   sur le lieu exact : « Les trois rings » attend la vraie photo des trois
   rings des Minimes. `big:true` = cellule mise en avant (mur de champion).
   ===================================================================== */
export const GALLERY = {
  filters: [
    { key: "all", label: "Tout" },
    { key: "salle", label: "La salle" },
    { key: "anglaise", label: "Boxe anglaise" },
    { key: "lady", label: "Lady" },
    { key: "educative", label: "L'école" },
    { key: "technique", label: "Technique" },
  ],
  /* Ce que le cadre coupe — la page galerie ne peut pas prétendre montrer
     la salle des Minimes (le shooting n'a pas eu lieu). Elle assume donc
     l'inverse : trois choses qu'AUCUNE photo ne rend, écrites dans la
     bouche du coach. C'est vrai d'une salle de boxe, ça ne prétend rien
     sur celle-ci, et ça donne à la page une raison d'exister au-delà de
     la mosaïque. */
  offFrame: [
    {
      n: "01",
      t: "Le bruit",
      d: "Douze sacs, trois rings, et le minuteur qui claque toutes les trois minutes. Une photo est muette — ici, tu entends la salle avant de la voir.",
    },
    {
      n: "02",
      t: "L'odeur",
      d: "Le cuir, la résine, l'humidité des gants qui sèchent. Ça ne se photographie pas et ça ne se nettoie pas non plus. C'est l'odeur d'une salle qui sert.",
    },
    {
      n: "03",
      t: "La voix du coach",
      d: "« Remonte ta droite. » Dix fois. Cent fois. C'est le seul son qui compte et c'est celui qu'aucune image ne t'apportera. Viens le prendre.",
    },
  ],
  shots: [
    { img: "/assets/img/bc/salle-1.webp", label: "Entre les cordes", zone: "salle", big: true },
    { img: "/assets/img/bc/anglaise-1.webp", label: "Sur le ring", zone: "anglaise" },
    { img: "/assets/img/bc/anglaise-2.webp", label: "Le noble art", zone: "anglaise" },
    { img: "/assets/img/bc/educative-1.webp", label: "Le premier gant", zone: "educative", big: true },
    { img: "/assets/img/bc/anglaise-3.webp", label: "Le sparring", zone: "anglaise" },
    { img: "/assets/img/bc/lady-1.webp", label: "Boxing Lady", zone: "lady" },
    { img: "/assets/img/bc/training-2.webp", label: "Pattes d'ours", zone: "technique" },
    { img: "/assets/img/bc/anglaise-4.webp", label: "Garde haute", zone: "anglaise" },
    { img: "/assets/img/bc/lady-2.webp", label: "Le sac", zone: "lady" },
    { img: "/assets/img/bc/cross-1.webp", label: "Cross training", zone: "technique" },
    { img: "/assets/img/bc/training-1.webp", label: "Cardio boxing", zone: "technique" },
    { img: "/assets/img/bc/levels-1.webp", label: "Tous les niveaux", zone: "salle" },
  ],
};
