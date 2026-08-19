/* =====================================================================
   BOXING CENTER — MINIMES · les disciplines

   Détaché de data.js pour une raison mesurée : le noyau part sur les 8
   pages (site.js en dépend), ces données-là n’en concernent que trois pages (accueil, activités, galerie).
   Les embarquer partout coûtait leur poids sur chaque page pour rien.
   ===================================================================== */

/* ⚠ DEUX textes par discipline, JAMAIS un seul (§5.9 « une bonne formule
   une seule fois par site ») :
   · `teaser` — l’accueil, et l’accueil SEUL. Une ligne qui oriente : le
     reel de la home est un aiguillage, pas un catalogue.
   · `desc` (+ `for` + `points`) — /activites/, et elle seule. C’est la
     page qui a le droit de développer.
   Les deux URL sont indexées : la même phrase rendue sur les deux, c’est
   du duplicate content et une bonne formule brûlée deux fois. Le défaut
   avait déjà été corrigé pour la FAQ (/le-club/ vs /contact/) ; il vivait
   encore ici. Toute discipline ajoutée doit arriver avec SES deux textes.

   `for` + `points` sont ADDITIFS : seule la page /activites/ les lit.

   `plan` = clé PLANNING correspondante, ou null. C’est le champ qui rend
   le catalogue HONNÊTE : cinq disciplines ont un créneau prouvé par le
   poster, trois n’en ont pas (elles se travaillent en accès libre ou
   dans le cours d’anglaise). La page affiche la différence au lieu de
   laisser croire que tout est au planning — et le badge « N créneaux »
   est DÉRIVÉ de PLANNING, donc il ne peut pas se désynchroniser.

   `noPhoto: true` = aucune photo du pool ne montre ce geste. Plus aucune
   discipline ne l’invoque depuis que les pieds-poings ont leur propre prise
   de vue ; le mecanisme reste la pour la prochaine. Même loi
   que le roster des coachs : on assume l’absence avec une tuile dessinée
   plutôt que d’illustrer des pieds-poings avec une photo de poings. */
export const DISCIPLINES = [
  {
    key: "anglaise",
    plan: "anglaise",
    name: "Boxe Anglaise Loisir",
    tag: "La spécialité maison",
    teaser: "Le geste de base, repris jusqu’à ce qu’il tienne tout seul.",
    desc: "Le noble art, à la source. Jab, esquive, jeu de jambes — sept créneaux par semaine, midi et soir. Le loisir, ici, c’est la vraie boxe, à ton rythme — et aucun coup à recevoir tant que tu ne le demandes pas.",
    img: "/assets/img/photos/cours-sacs-1200.webp",
    for: "Du grand débutant au boxeur expérimenté.",
    points: [
      "Le midi de 12h40 à 13h20 : mardi, mercredi, jeudi",
      "Le soir de 19h40 à 21h : lundi, mardi, jeudi, vendredi",
      "Sept créneaux loisirs par semaine, tous tenus par Mehdi",
      "Gants et protections prêtés le temps de l’essai",
      "Le sparring ne s’impose jamais — il se demande",
    ],
  },
  {
    key: "competiteurs",
    plan: "competiteurs",
    name: "Boxe Compétiteurs",
    tag: "Le ring, pour de vrai",
    teaser: "Le cours qui mène au ring, et nulle part ailleurs.",
    desc: "18h à 19h30, quatre soirs par semaine — plus l’open sparring du samedi. Ceux qui montent à l’open sparring du samedi ont fait leurs heures ici. On n’y entre pas en s’inscrivant : c’est Mehdi qui te fait passer, quand tu es prêt — et seulement si tu en as envie.",
    img: "/assets/img/photos/sparring-graff-1200.webp",
    for: "Les licenciés — et ceux qui le deviendront, à leur rythme.",
    points: [
      "De 18h à 19h30 : lundi, mardi, jeudi, vendredi",
      "Open sparring le samedi 18h30 — le test de la semaine",
      "Lundi, mardi et jeudi, le second espace tourne en parallèle",
      "On ne s’inscrit pas : c’est Mehdi qui te fait passer",
    ],
  },
  {
    key: "educative",
    plan: "educative",
    name: "Boxe Éducative",
    tag: "Dès 3 ans",
    teaser: "Le mercredi et le samedi appartiennent aux enfants.",
    desc: "De la Baby Boxe 3/6 aux jeunes compétiteurs, la règle est fédérale et stricte : on touche, on ne frappe pas. Ils arrivent en courant partout, ils repartent en marchant droit.",
    img: "/assets/img/photos/ecole-enfant-1200.webp",
    for: "Les enfants et les ados, du jeu au ring.",
    points: [
      "Baby Boxe 3/6 ans, le samedi à 14h15",
      "Enfants 7/11 ans à 15h, ados 12/16 ans à 16h",
      "Jeunes compétiteurs à 17h — pour ceux qui veulent le ring",
      "Mercredi et samedi, la même montée d’âge, le même coach",
    ],
  },
  {
    key: "lady",
    plan: "lady",
    name: "Boxing Lady",
    tag: "100 % féminin",
    teaser: "Entre femmes, le lundi et le mercredi soir.",
    desc: "Deux soirs, une bande, et le sac qui prend tout. Chloé le lundi, David le mercredi — entre femmes, avec un vrai apprentissage de la technique. Beaucoup y débutent ; certaines passent ensuite en mixte. Les deux sont très bien.",
    img: "/assets/img/photos/lady-garde-1200.webp",
    for: "Les femmes, débutantes comme habituées.",
    points: [
      "Lundi 18h30 avec Chloé, mercredi 18h30 avec David",
      "Une heure pleine, 18h30 à 19h30",
      "Sac, technique, cardio — la boxe sans le cliché",
      "Tu viens comme tu es, on te prête le reste",
    ],
  },
  {
    key: "camp",
    plan: "camp",
    name: "Boxing Camp",
    tag: "Le circuit",
    teaser: "Cinq rendez-vous par semaine, juste pour le moteur.",
    desc: "Le cours qui te construit la caisse d’un boxeur sans te demander de savoir boxer. Ça enchaîne, ça ne discute pas — et à la fin, tu as la sensation d’avoir vraiment bossé.",
    img: "/assets/img/photos/jumps-groupe-1200.webp",
    for: "Les adultes, tous niveaux — aucune technique exigée.",
    points: [
      "Lundi et vendredi à 12h40, sur la pause déjeuner",
      "Mardi et jeudi à 18h30 avec Hicham",
      "Samedi 11h à 12h avec Mehdi",
      "Le seul cours où tu peux venir sans rien savoir faire",
    ],
  },
  {
    key: "pieds-poings",
    plan: "pieds-poings",
    name: "Boxe Pieds-Poings",
    tag: "L’autre garde",
    teaser: "Le mercredi soir, on boxe aussi avec les jambes.",
    desc: "Une fois par semaine, la garde change et les jambes entrent dans l’histoire. Même exigence de geste que l’anglaise, deux fois plus de gestes à apprendre.",
    img: "/assets/img/photos/pieds-poings-1200.webp",
    /* prise serrée : à 28 % la bande large ne montrait qu’un menton coupé. */
    focus: "45%",
    for: "Tous niveaux — y compris ceux qui n’ont jamais lancé un coup de pied.",
    points: [
      "Mercredi 19h40 à 21h, avec David",
      "Le seul créneau pieds-poings de la semaine",
      "La garde et le placement d’abord, la puissance après",
    ],
  },
  {
    key: "paos",
    plan: null,
    freeNote: "Dans le cours d’anglaise",
    name: "PAOS & Pattes d’ours",
    tag: "Travail technique",
    teaser: "Le travail aux pattes, à l’intérieur du cours d’anglaise.",
    desc: "Face au coach, sur les pattes : précision, vitesse, lecture. Le vrai boulot de boxeur, celui qu’on ne triche pas.",
    img: "/assets/img/photos/pattes-ours-1200.webp",
    for: "Ceux qui veulent le geste juste, pas juste la sueur.",
    points: [
      "Pas de créneau à part : ça vit dans le cours d’anglaise",
      "En tête-à-tête avec le coach, sur les pattes",
      "Le timing : partir avant que la patte arrive",
      "Le geste que le juge voit, celui que le sac ne t’apprendra jamais",
    ],
  },
  {
    key: "cross",
    plan: null,
    freeNote: "En accès libre, à l’étage",
    name: "Cross Training",
    tag: "La caisse",
    teaser: "L’étage t’est ouvert dès que la salle l’est.",
    desc: "Gainage, cardio, explosivité. La caisse qui te fait tenir le dernier round. À l’étage, quand tu veux.",
    img: "/assets/img/photos/cross-rack-1200.webp",
    for: "Ceux qui veulent la caisse d’un boxeur.",
    points: [
      "Pas de créneau : la zone prépa est à toi en accès libre",
      "10h–12h et 13h20–18h, du lundi au samedi",
      "À l’étage, au-dessus des rings",
      "Zéro contact, intensité réelle",
    ],
  },
  {
    key: "cardio",
    plan: null,
    freeNote: "En accès libre, sur les sacs",
    name: "Cardio Boxing",
    tag: "Sans contact",
    teaser: "Tu frappes le sac, personne ne te frappe.",
    desc: "Tout le geste, toute la sueur, aucun coup encaissé. La porte d’entrée quand on n’a jamais boxé.",
    img: "/assets/img/photos/ballon-vitesse-1200.webp",
    for: "Les débutants et ceux qui veulent transpirer sans encaisser.",
    points: [
      "Pas de créneau : douze sacs lourds, en accès libre",
      "Tout le geste de boxe, aucun coup reçu",
      "Si tu veux le cours encadré, c’est le Boxing camp",
      "Le coach t’arrête avant que tu te fasses mal",
    ],
  },
];
