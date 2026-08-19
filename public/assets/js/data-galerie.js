/* =====================================================================
   BOXING CENTER — MINIMES · la galerie

   Détaché de data.js pour une raison mesurée : le noyau part sur les 8
   pages (site.js en dépend), ces données-là n’en concernent que une seule page.
   Les embarquer partout coûtait leur poids sur chaque page pour rien.
   ===================================================================== */

/* =====================================================================
   LA GALERIE — pool photo RÉEL Boxing Center (servi en placeholder depuis
   le site Portet), gradé N&B par le CSS. ⚠ à remplacer par les vraies
   photos des Minimes. Les légendes décrivent l’ACTIVITÉ, jamais un claim
   sur le lieu exact : « Les rings » attend la vraie photo des trois
   rings des Minimes. `big:true` = cellule mise en avant (mur de champion).
   ===================================================================== */
export const GALLERY = {
  filters: [
    { key: "all", label: "Tout" },
    { key: "salle", label: "La salle" },
    { key: "anglaise", label: "Boxe anglaise" },
    { key: "lady", label: "Lady" },
    { key: "educative", label: "L’école" },
    { key: "technique", label: "Technique" },
  ],
  /* Ce que le cadre coupe — la page galerie ne peut pas prétendre montrer
     la salle des Minimes (le shooting n’a pas eu lieu). Elle assume donc
     l’inverse : trois choses qu’AUCUNE photo ne rend, écrites dans la
     bouche du coach. C’est vrai d’une salle de boxe, ça ne prétend rien
     sur celle-ci, et ça donne à la page une raison d’exister au-delà de
     la mosaïque. */
  offFrame: [
    {
      n: "01",
      t: "Le bruit",
      d: "Douze sacs, plusieurs rings, et le minuteur qui claque toutes les trois minutes. Une photo est muette — ici, tu entends la salle avant de la voir.",
    },
    {
      n: "02",
      t: "L’odeur",
      d: "Le cuir, la résine, l’humidité des gants qui sèchent. Ça ne se photographie pas et ça ne se nettoie pas non plus. C’est l’odeur d’une salle qui sert.",
    },
    {
      n: "03",
      t: "La voix du coach",
      d: "« Remonte ta droite. » Dix fois. Cent fois. C’est le seul son qui compte et c’est celui qu’aucune image ne t’apportera. Viens le prendre.",
    },
  ],
  /* `label` = la pastille mono posée sur la vignette. `alt` = ce que voit
     quelqu'un qui ne voit pas l'image — et ce que lit Google Images, qui
     n'indexe rien sans lui. Les deux ne disent pas la même chose et ne
     doivent jamais être confondus : la pastille est une accroche, l'alt
     est une description.

     ⚠ RÈGLE TENUE ICI : ces alt décrivent l'ACTIVITÉ, jamais la pièce.
     Le pool est encore celui de Portet (voir l'avertissement plus haut) —
     écrire « la salle des Minimes » sous ces fichiers serait faux, et un
     alt faux vaut moins que pas d'alt du tout. Au shooting, ils pourront
     nommer la salle ; pas avant.

     `w`/`h` : les dimensions réelles du fichier. Le navigateur réserve la
     place avant que la photo arrive (plus de saut de mise en page), et
     Google classe mal une image dont il ignore la taille. */
  shots: [
    { img: "/assets/img/photos/salle-plongee-1200.webp", w: 768, h: 512, label: "Entre les cordes", alt: "Le ring vu depuis le coin, cordes tendues et sacs de frappe en arrière-plan — Boxing Center, Toulouse.", zone: "salle", big: true },
    { img: "/assets/img/photos/cours-sacs-1200.webp", w: 768, h: 512, label: "Sur le ring", alt: "Cours de boxe anglaise sur le ring : deux boxeurs gantés, garde haute, en round d'assaut — Boxing Center, Toulouse.", zone: "anglaise" },
    { img: "/assets/img/photos/sparring-graff-1200.webp", w: 768, h: 512, label: "Le noble art", alt: "Travail de déplacements et de garde en boxe anglaise, gants et casque de protection — Boxing Center, Toulouse.", zone: "anglaise" },
    { img: "/assets/img/photos/ecole-enfant-1200.webp", w: 768, h: 512, label: "Le premier gant", alt: "Cours de boxe éducative pour enfants : les gants sont plus gros que les mains, le coach corrige la position — Boxing Center, Toulouse.", zone: "educative", big: true },
    { img: "/assets/img/photos/ring-cours-rouge-1200.webp", w: 768, h: 512, label: "Le sparring", alt: "Sparring encadré sur le ring, casque et protège-dents, le coach au bord des cordes — Boxing Center, Toulouse.", zone: "anglaise" },
    { img: "/assets/img/photos/lady-sac-1200.webp", w: 1433, h: 1080, label: "Boxing Lady", alt: "Le cours Lady Boxing, réservé aux femmes : rang de pratiquantes gantées face aux sacs — Boxing Center, Toulouse.", zone: "lady" },
    { img: "/assets/img/photos/pattes-ours-1200.webp", w: 768, h: 512, label: "Pattes d’ours", alt: "Travail technique aux pattes d'ours : le coach tient les cibles, le boxeur enchaîne direct et crochet — Boxing Center, Toulouse.", zone: "technique" },
    { img: "/assets/img/photos/allee-sacs-1200.webp", w: 768, h: 512, label: "Garde haute", alt: "Frappe au sac lourd, garde haute et coudes serrés, mains bandées — Boxing Center, Toulouse.", zone: "anglaise" },
    { img: "/assets/img/photos/coach-lady-1200.webp", w: 768, h: 512, label: "Le sac", alt: "Séance Lady Boxing au sac : appui avant marqué, épaule qui protège le menton — Boxing Center, Toulouse.", zone: "lady" },
    { img: "/assets/img/photos/cross-rack-1200.webp", w: 768, h: 512, label: "Cross training", alt: "Circuit de cross training : gainage, charges libres et corde, entre deux rounds de boxe — Boxing Center, Toulouse.", zone: "technique" },
    { img: "/assets/img/photos/ballon-vitesse-1200.webp", w: 768, h: 512, label: "Cardio boxing", alt: "Cours de cardio boxing sans opposition : le groupe enchaîne les combinaisons au rythme du minuteur — Boxing Center, Toulouse.", zone: "technique" },
    { img: "/assets/img/photos/jumps-groupe-1200.webp", w: 769, h: 512, label: "Tous les niveaux", alt: "Débutants et compétiteurs s'entraînent côte à côte sur le même plateau — Boxing Center, Toulouse.", zone: "salle" },
  ],
};
