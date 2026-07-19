/* =====================================================================
   BOXING CENTER — MINIMES · "LE BERCEAU"
   Content source of truth (maquette).
   Kept as a plain ES module so the team can map it 1:1 onto Astro/Next
   content collections or props. NOTHING here is hard-coded in markup that
   repeats — the JS renders these into the page.  Swap values freely.
   ===================================================================== */

export const SALLE = {
  id: "minimes",
  name: "Boxing Center Minimes",
  short: "Minimes",
  baseline: "Le berceau des champions.",
  district: "Barrière de Paris · Les Minimes",
  since: 2016,                       // Boxing Center créé le 01/09/2016 ; Minimes = 1re salle du groupe

  address: {
    street: "12 rue de Fenouillet",
    zip: "31200",
    city: "Toulouse",
    full: "12 rue de Fenouillet, 31200 Toulouse",
  },
  access: [
    "Métro ligne B — station Barrière de Paris (3 min à pied)",
    "Rocade — sortie 31, direction Les Minimes",
    "Bus 70 / 27 — arrêt Minimes-Roquelaine",
  ],
  phone: "05 62 24 46 82",
  phoneHref: "+33562244682",
  email: "boxingcenter31@gmail.com",
  hours: "Lun – Sam · 10h00 – 21h30",
  hoursData: [
    { d: "Lundi – Vendredi", h: "10h00 – 21h30" },
    { d: "Samedi", h: "10h00 – 21h30" },
    { d: "Dimanche", h: "Fermé" },
  ],
  federations: ["FFBoxe", "FFKMDA", "FMMAF"],
  mapsUrl:
    "https://www.google.com/maps?q=12%20rue%20de%20Fenouillet%2031200%20Toulouse&output=embed",
  mapsLink:
    "https://maps.google.com/?q=12+rue+de+Fenouillet+31200+Toulouse",
};

/* Anti-péremption : toute mention de saison passe par ces constantes,
   jamais de date en dur dans une page — <title>/description/og compris.
   (STANDARDS §0.3 + §4) */
export const SEASON = "2026-2027";
export const SEASON_LABEL = "Saison 2026 — 2027";

/* Libellés CTA — DEUX, pour tout le site, pour toujours (STANDARDS §1).
   `chrome` = nav / footer / menu · `primary` = tout CTA principal en page.
   ⚠ Ne PAS inventer une 3e formulation. */
export const CTA = {
  chrome: "Essai · 10€",
  primary: "Réserver mon essai · 10€",
};

/* Colonne vertébrale conversion — tout pointe vers la boutique box-plus.
   Liens VÉRIFIÉS le 2026-07-12 (STANDARDS §1). Ne PAS inventer de tunnel :
   /offre-duo-rentree, /offre-saison-259, /seance-essai-gratuite = 404. */
export const LINKS = {
  essai: "https://box-plus.vercel.app/seance-essai",   // essai 10€ — CTA principal de CHAQUE page
  abonnements: "https://box-plus.vercel.app/abonnements",
  enfants: "https://box-plus.vercel.app/abonnements#enfants",
  promos: "https://box-plus.vercel.app/abonnements#promotions",
  coachings: "https://box-plus.vercel.app/coachings",
  boutique: "https://box-plus.vercel.app/materiel",
  offreRentree: "/tarifs/",   // la carte "Offre Rentrée" de l'accueil reste interne → /tarifs/
  groupe: "https://boxingcenter.fr/",
  facebook: "https://www.facebook.com/BoxingCenterToulouse/",
  instagram: "https://www.instagram.com/boxingcentertoulouse/",
};

/* Les offres — source de vérité : posters officiels rentrée + 01_OFFRES/
   OFFRES_RENTREE_2026.md. Datées par SEASON, jamais codées en dur dans le markup.
   ⚠ « DUO 29€ » ne s'écrit JAMAIS sans « par personne ». */
export const PROMOS = {
  saison: SEASON,
  label: SEASON_LABEL,
  bonus: "T-shirt Boxing Center offert aux 100 premiers inscrits.",
  cards: [
    {
      key: "essai",
      name: "La séance d'essai",
      price: "10€",
      period: "la séance",
      feature: "Toutes disciplines, matériel prêté, sans engagement",
      items: ["Toutes les disciplines de la salle", "Gants et protections prêtés", "Sans engagement, sans dossier"],
      cta: CTA.primary,
      href: "https://box-plus.vercel.app/seance-essai",
    },
    {
      key: "duo",
      name: "L'offre Duo",
      price: "29€",
      unit: "par personne",
      was: "44€",
      period: "· 4 semaines",
      feature: "Cours illimités à deux, sans engagement",
      items: ["29€ par personne (au lieu de 44€)", "4 semaines de cours illimités", "Toutes les disciplines", "Sans engagement"],
      cta: "Je viens avec mon binôme",
      href: "https://box-plus.vercel.app/abonnements#promotions",
      tag: "La priorité",
      highlight: true,
    },
    {
      key: "saison",
      name: "La saison complète",
      price: "259€",
      was: "400€",
      period: "les 12 mois",
      feature: "Payable en 4× sans frais · accès libre aux 5 clubs",
      items: ["259€ les 12 mois (au lieu de 400€)", "Payable en 4× sans frais", "Anglaise, MMA, pieds-poings, Lady, Fitness", "Accès libre aux 5 clubs du réseau"],
      cta: "Je prends ma saison",
      href: "https://box-plus.vercel.app/abonnements#promotions",
      tag: "L'abonnement",
    },
    {
      key: "ecole",
      name: "L'école, dès 3 ans",
      price: "dès 280€",
      period: "l'année",
      feature: "Baby Boxe 3/6 · éducative 7/11 · ados 12/16",
      items: ["Baby Boxe dès 3 ans (3/6 ans)", "Boxe éducative 7/11 ans", "Ados 12/16 ans", "Compétiteurs encadrés par Mehdi B"],
      cta: "Inscrire mon enfant",
      href: "https://box-plus.vercel.app/abonnements#enfants",
    },
  ],
};

/* Avis Google réels (verbatim, curés le 2026-07-12) — jamais inventés.
   Source : fiche Google Boxing Center Minimes. */
export const REVIEWS = {
  rating: "4,3",
  scale: "5",
  count: 157,
  source: "Avis Google",
  quotes: [
    { text: "Très belle salle de boxe. Matos au top, coach et staff accueillant.", author: "Hamed S.", stars: 5 },
    { text: "J'ai adoré mes trois ans passés à faire du sport à Boxing Center. Équipe au top.", author: "Salomé C.", stars: 5 },
    { text: "Superbe salle, très bonne ambiance. Je pratique les cours de boxe anglaise loisir.", author: "Pascal L.", stars: 5 },
  ],
};

/* Médias : vraies photos Boxing Center (site Portet) servies en placeholder,
   passées en N&B par CSS. ⚠ à remplacer par les vraies photos des Minimes.
   ⚠ Les légendes décrivent l'ACTIVITÉ (le geste), jamais un claim sur le lieu
   exact — tant que le shooting Minimes n'a pas eu lieu. */
export const MEDIA = "https://www.boxing-center-portet.fr";

export const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/activites/", label: "Activités" },
  { href: "/le-club/", label: "Le club" },
  { href: "/coachs/", label: "Coachs" },
  { href: "/galerie/", label: "Galerie" },
  { href: "/plannings/", label: "Planning" },
  { href: "/tarifs/", label: "Tarifs" },
  { href: "/contact/", label: "Contact" },
];

/* La toise — chiffres qui content le palmarès, pas la surface */
export const STATS = [
  { v: 3, suffix: "", l: "rings — pas une salle de sport" },
  { v: 3, suffix: "", l: "pros sortis de ces cordes" },
  { v: 30, suffix: "+", l: "amateurs passés par l'école" },
  { v: 2016, suffix: "", l: "depuis", raw: true },
];

/* ⚠ DEUX textes par discipline, JAMAIS un seul (§5.9 « une bonne formule
   une seule fois par site ») :
   · `teaser` — l'accueil, et l'accueil SEUL. Une ligne qui oriente : le
     reel de la home est un aiguillage, pas un catalogue.
   · `desc` (+ `for` + `points`) — /activites/, et elle seule. C'est la
     page qui a le droit de développer.
   Les deux URL sont indexées : la même phrase rendue sur les deux, c'est
   du duplicate content et une bonne formule brûlée deux fois. Le défaut
   avait déjà été corrigé pour la FAQ (/le-club/ vs /contact/) ; il vivait
   encore ici. Toute discipline ajoutée doit arriver avec SES deux textes.

   `for` + `points` sont ADDITIFS : seule la page /activites/ les lit.

   `plan` = clé PLANNING correspondante, ou null. C'est le champ qui rend
   le catalogue HONNÊTE : cinq disciplines ont un créneau prouvé par le
   poster, trois n'en ont pas (elles se travaillent en accès libre ou
   dans le cours d'anglaise). La page affiche la différence au lieu de
   laisser croire que tout est au planning — et le badge « N créneaux »
   est DÉRIVÉ de PLANNING, donc il ne peut pas se désynchroniser.

   `noPhoto: true` = aucune photo du pool ne montre ce geste. Même loi
   que le roster des coachs : on assume l'absence avec une tuile dessinée
   plutôt que d'illustrer des pieds-poings avec une photo de poings. */
export const DISCIPLINES = [
  {
    key: "anglaise",
    plan: "anglaise",
    name: "Boxe Anglaise",
    tag: "La spécialité maison",
    teaser: "Le geste de base, repris jusqu'à ce qu'il tienne tout seul.",
    desc: "Le noble art, à la source. Jab, esquive, jeu de jambes — la discipline qui a fait le nom des Minimes.",
    img: "/assets/img/bc/anglaise-1.webp",
    for: "Du grand débutant au compétiteur licencié.",
    points: [
      "Le midi de 12h40 à 13h20 : mardi, mercredi, jeudi",
      "Le soir de 19h40 à 21h : lundi, mardi, jeudi, vendredi",
      "Sept créneaux loisirs par semaine, tous tenus par Mehdi B",
      "Gants et protections prêtés le temps de l'essai",
    ],
  },
  {
    key: "competiteurs",
    plan: "competiteurs",
    name: "Boxe Compétiteurs",
    tag: "Le ring, pour de vrai",
    teaser: "Le cours qui mène au ring, et nulle part ailleurs.",
    desc: "18h à 19h30, quatre soirs par semaine. Ceux qui se frottent au sparring du samedi ont fait leurs heures ici. Licence exigée, excuses interdites.",
    img: "/assets/img/bc/anglaise-2.webp",
    for: "Les licenciés, et ceux que le coach juge prêts à le devenir.",
    points: [
      "De 18h à 19h30 : lundi, mardi, jeudi, vendredi",
      "Open sparring le samedi 18h30 — le test de la semaine",
      "Lundi, mardi et jeudi, le second espace tourne en parallèle",
      "On ne s'inscrit pas : c'est Mehdi B qui te fait passer",
    ],
  },
  {
    key: "educative",
    plan: "educative",
    name: "Boxe Éducative",
    tag: "Dès 3 ans",
    teaser: "Le mercredi et le samedi appartiennent aux enfants.",
    desc: "De la Baby Boxe 3/6 aux jeunes compétiteurs : on apprend à se tenir droit avant d'apprendre à frapper. Ils arrivent en courant partout, ils repartent en marchant droit.",
    img: "/assets/img/bc/educative-1.webp",
    for: "Les enfants et les ados, du jeu au ring.",
    points: [
      "Baby Boxe 3/6 ans, le samedi à 14h15",
      "Enfants 7/11 ans à 15h, ados 12/16 ans à 16h",
      "Jeunes compétiteurs à 17h — pour ceux qui veulent le ring",
      "Mercredi et samedi, la même montée d'âge, le même coach",
    ],
  },
  {
    key: "lady",
    plan: "lady",
    name: "Boxing Lady",
    tag: "100 % féminin",
    teaser: "Entre femmes, le lundi et le mercredi soir.",
    desc: "Deux soirs, une bande, et le sac qui prend tout. Tu repars plus solide qu'en arrivant.",
    img: "/assets/img/bc/lady-2.webp",
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
    desc: "Le cours qui te construit la caisse d'un boxeur sans te demander de savoir boxer. Ça enchaîne, ça ne discute pas, et à la fin tu es cuit.",
    img: "/assets/img/bc/levels-1.webp",
    for: "Les adultes, tous niveaux — aucune technique exigée.",
    points: [
      "Lundi et vendredi à 12h40, sur la pause déjeuner",
      "Mardi et jeudi à 18h30 avec Hicham",
      "Samedi 11h à 12h avec Mehdi B",
      "Le seul cours où tu peux venir sans rien savoir faire",
    ],
  },
  {
    key: "pieds-poings",
    plan: "pieds-poings",
    name: "Boxe Pieds-Poings",
    tag: "L'autre garde",
    teaser: "Le mercredi soir, on boxe aussi avec les jambes.",
    noPhoto: true,
    desc: "Une fois par semaine, la garde change et les jambes entrent dans l'histoire. Même exigence de geste que l'anglaise, deux armes de plus.",
    img: null,
    for: "Tous niveaux — y compris ceux qui n'ont jamais lancé un coup de pied.",
    points: [
      "Mercredi 19h40 à 21h, avec David",
      "Le seul créneau pieds-poings de la semaine",
      "La garde et le placement d'abord, la puissance après",
      "Aucune photo de ce cours ici — on ne t'en montrera pas une fausse",
    ],
  },
  {
    key: "paos",
    plan: null,
    freeNote: "Dans le cours d'anglaise",
    name: "PAOS & Pattes d'ours",
    tag: "Travail technique",
    teaser: "Le travail aux pattes, à l'intérieur du cours d'anglaise.",
    desc: "Face au coach, sur les pattes : précision, vitesse, lecture. Le vrai boulot de boxeur, celui qu'on ne triche pas.",
    img: "/assets/img/bc/training-2.webp",
    for: "Ceux qui veulent le geste juste, pas juste la sueur.",
    points: [
      "Pas de créneau à part : ça vit dans le cours d'anglaise",
      "En tête-à-tête avec le coach, sur les pattes",
      "Le timing : partir avant que la patte arrive",
      "Le geste que le juge voit, celui que le sac ne t'apprendra jamais",
    ],
  },
  {
    key: "cross",
    plan: null,
    freeNote: "En accès libre, à l'étage",
    name: "Cross Training",
    tag: "La caisse",
    teaser: "L'étage t'est ouvert dès que la salle l'est.",
    desc: "Gainage, cardio, explosivité. La caisse qui te fait tenir le dernier round. À l'étage, quand tu veux.",
    img: "/assets/img/bc/cross-1.webp",
    for: "Ceux qui veulent la caisse d'un boxeur.",
    points: [
      "Pas de créneau : la zone prépa est à toi en accès libre",
      "10h–12h et 13h20–18h, du lundi au samedi",
      "À l'étage, au-dessus des rings",
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
    desc: "Tout le geste, toute la sueur, aucun coup encaissé. La porte d'entrée quand on n'a jamais boxé.",
    img: "/assets/img/bc/training-1.webp",
    for: "Les débutants et ceux qui veulent transpirer sans encaisser.",
    points: [
      "Pas de créneau : douze sacs lourds, en accès libre",
      "Tout le geste de boxe, aucun coup reçu",
      "Si tu veux le cours encadré, c'est le Boxing camp",
      "Le coach t'arrête avant que tu te fasses mal",
    ],
  },
];

/* =====================================================================
   LE PLANNING — transcription du poster officiel SAISON 2026-2027
   (« PLANNING DES COURS », Barrière de Paris / Minimes ; roster.json fait
   foi). C'est la SOURCE de la grille HTML filtrable de /plannings/
   (STANDARDS §3) ET des repères de la page. ⚠ Aucun créneau n'est inventé :
   si le poster ne le prouve pas, il n'est pas ici.
   `d` = jour · `h` = début · `end` = fin (quand le poster la donne)
   `disc` = clé de discipline (filtre) · `coach` = prénom du poster (filtre)
   ===================================================================== */
export const PLANNING_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export const PLANNING_DISCIPLINES = [
  { key: "anglaise", label: "Anglaise loisirs" },
  { key: "competiteurs", label: "Compétiteurs" },
  { key: "educative", label: "L'école" },
  { key: "lady", label: "Boxing Lady" },
  { key: "camp", label: "Boxing camp" },
  { key: "sparring", label: "Open sparring" },
  { key: "pieds-poings", label: "Pieds-poings" },
];

/* `h`/`end` = début/fin EXACTES du poster (chaque cours en a une : la
   colonne HORAIRE les donne toutes). `space` = la sous-colonne « 1 » ou
   « 2 » du poster — lundi, mardi et jeudi font tourner DEUX espaces en
   parallèle le soir. C'est une info du poster qu'on perdait entièrement. */
export const PLANNING = [
  /* ---- Lundi ---- */
  { d: "Lundi", h: "12h40", end: "13h20", disc: "camp", name: "Boxing camp", coach: "Mehdi B", age: "Adultes" },
  { d: "Lundi", h: "18h00", end: "19h30", disc: "competiteurs", name: "Boxe compétiteurs", coach: "Mehdi B", age: "Licenciés", space: 1 },
  { d: "Lundi", h: "18h30", end: "19h30", disc: "lady", name: "Boxing Lady", coach: "Chloé", age: "100 % féminin", space: 2 },
  { d: "Lundi", h: "19h40", end: "21h00", disc: "anglaise", name: "Boxe anglaise (loisirs)", coach: "Mehdi B", age: "Tous niveaux" },

  /* ---- Mardi ---- */
  { d: "Mardi", h: "12h40", end: "13h20", disc: "anglaise", name: "Boxe anglaise (loisirs)", coach: "Mehdi B", age: "Tous niveaux" },
  { d: "Mardi", h: "18h00", end: "19h30", disc: "competiteurs", name: "Boxe compétiteurs", coach: "Mehdi B", age: "Licenciés", space: 1 },
  { d: "Mardi", h: "18h30", end: "19h30", disc: "camp", name: "Boxing camp", coach: "Hicham", age: "Adultes", space: 2 },
  { d: "Mardi", h: "19h40", end: "21h00", disc: "anglaise", name: "Boxe anglaise (loisirs)", coach: "Mehdi B", age: "Tous niveaux" },

  /* ---- Mercredi ---- */
  { d: "Mercredi", h: "12h40", end: "13h20", disc: "anglaise", name: "Boxe anglaise (loisirs)", coach: "Mehdi B", age: "Tous niveaux" },
  { d: "Mercredi", h: "15h00", end: "16h00", disc: "educative", name: "Boxe éducative enfants", coach: "Mehdi B", age: "7/11 ans" },
  { d: "Mercredi", h: "16h00", end: "17h00", disc: "educative", name: "Boxe éducative ados", coach: "Mehdi B", age: "12/16 ans" },
  { d: "Mercredi", h: "17h00", end: "18h30", disc: "educative", name: "Boxe éducative compétiteurs", coach: "Mehdi B", age: "Jeunes licenciés" },
  { d: "Mercredi", h: "18h30", end: "19h30", disc: "lady", name: "Boxing Lady", coach: "David", age: "100 % féminin" },
  { d: "Mercredi", h: "19h40", end: "21h00", disc: "pieds-poings", name: "Boxe pieds-poings", coach: "David", age: "Tous niveaux" },

  /* ---- Jeudi ---- */
  { d: "Jeudi", h: "12h40", end: "13h20", disc: "anglaise", name: "Boxe anglaise (loisirs)", coach: "Mehdi B", age: "Tous niveaux" },
  { d: "Jeudi", h: "18h00", end: "19h30", disc: "competiteurs", name: "Boxe compétiteurs", coach: "Mehdi B", age: "Licenciés", space: 1 },
  { d: "Jeudi", h: "18h30", end: "19h30", disc: "camp", name: "Boxing camp", coach: "Hicham", age: "Adultes", space: 2 },
  { d: "Jeudi", h: "19h40", end: "21h00", disc: "anglaise", name: "Boxe anglaise (loisirs)", coach: "Mehdi B", age: "Tous niveaux" },

  /* ---- Vendredi ---- */
  { d: "Vendredi", h: "12h40", end: "13h20", disc: "camp", name: "Boxing camp", coach: "Mehdi B", age: "Adultes" },
  { d: "Vendredi", h: "18h00", end: "19h30", disc: "competiteurs", name: "Boxe compétiteurs", coach: "Mehdi B", age: "Licenciés" },
  { d: "Vendredi", h: "19h40", end: "21h00", disc: "anglaise", name: "Boxe anglaise (loisirs)", coach: "Mehdi B", age: "Tous niveaux" },

  /* ---- Samedi ---- */
  { d: "Samedi", h: "11h00", end: "12h00", disc: "camp", name: "Boxing camp", coach: "Mehdi B", age: "Adultes" },
  { d: "Samedi", h: "14h15", end: "15h00", disc: "educative", name: "Baby Boxe", coach: "Mehdi B", age: "3/6 ans" },
  { d: "Samedi", h: "15h00", end: "16h00", disc: "educative", name: "Boxe éducative enfants", coach: "Mehdi B", age: "7/11 ans" },
  { d: "Samedi", h: "16h00", end: "17h00", disc: "educative", name: "Boxe éducative ados", coach: "Mehdi B", age: "12/16 ans" },
  { d: "Samedi", h: "17h00", end: "18h30", disc: "educative", name: "Boxe éducative compétiteurs", coach: "Mehdi B", age: "Jeunes licenciés" },
  { d: "Samedi", h: "18h30", end: "19h30", disc: "sparring", name: "Open sparring", coach: "Mehdi B", age: "Licenciés" },
];

/* L'ACCÈS LIBRE — les blocs gris du poster, qui en occupent la moitié et
   que la grille ignorait complètement. Chaque bande correspond à un
   libellé de la colonne HORAIRE : les treize libellés du poster sont tous
   utilisés une fois et une seule (cours ou accès libre), ce qui est le
   contrôle de cohérence de cette transcription. Pas de coach, pas de
   réservation : la salle est ouverte, tu bosses seul. */
export const PLANNING_FREE = [
  { d: "Lundi", h: "10h00", end: "12h00" },
  { d: "Lundi", h: "13h20", end: "18h00" },
  { d: "Lundi", h: "18h00", end: "19h30", space: 2 },
  { d: "Mardi", h: "10h00", end: "12h00" },
  { d: "Mardi", h: "13h20", end: "18h00" },
  { d: "Mardi", h: "18h00", end: "19h30", space: 2 },
  { d: "Mercredi", h: "10h00", end: "12h00" },
  { d: "Mercredi", h: "13h20", end: "15h00" },
  { d: "Jeudi", h: "10h00", end: "12h00" },
  { d: "Jeudi", h: "13h20", end: "18h00" },
  { d: "Jeudi", h: "18h00", end: "19h30", space: 2 },
  { d: "Vendredi", h: "10h00", end: "12h00" },
  { d: "Vendredi", h: "13h20", end: "18h00" },
  { d: "Samedi", h: "10h00", end: "12h00" },
  { d: "Samedi", h: "12h40", end: "14h00" },
  { d: "Samedi", h: "19h40", end: "21h00" },
];

/* Les repères de /plannings/ — dérivés du PLANNING ci-dessus, jamais tapés
   dans le markup (§0.10 : aucun nom de coach en dur dans un HTML). */
export const PLANNING_KEYS = [
  { n: "01", t: "L'accès libre", d: "Tous les jours de 10h à 12h, et tout l'après-midi de 13h20 à 18h : rings et sacs en autonomie, sans réservation. Le mercredi ça s'arrête à 15h, l'école prend la salle." },
  { n: "02", t: "L'école, dès 3 ans", d: "Baby Boxe 3/6 ans le samedi à 14h15. Puis les 7/11 à 15h, les 12/16 à 16h, les jeunes compétiteurs à 17h — le mercredi et le samedi, la même montée d'âge." },
  { n: "03", t: "Boxing Lady", d: "Lundi 18h30 avec Chloé, mercredi 18h30 avec David. Une heure, deux soirs, et le second espace de la salle rien que pour elles le lundi." },
  { n: "04", t: "La boxe sérieuse", d: "Compétiteurs de 18h à 19h30 le lundi, le mardi, le jeudi et le vendredi. Open sparring le samedi 18h30. Et l'anglaise loisirs à 19h40, les quatre mêmes soirs." },
];

/* Le Mur des Champions — interaction signature.
   Boxeurs réels formés aux Minimes (source boxingcenter.fr).
   ⚠ CONTENT GATE : le club n'a confirmé NI la catégorie de poids, NI le
   palmarès, NI la date de passage pro. Tant que ce n'est pas signé, on ne
   publie QUE ce qu'il ne peut pas contester : le nom + une ligne. Ne PAS
   réintroduire `weight` / `record` sans validation écrite du club. */
export const CHAMPIONS = [
  { name: "Johnson Suffo", last: "Suffo", years: "Pro", note: "Formé sur ces rings, passé professionnel.", img: "/assets/img/bc/cutouts/johnson-suffo.webp" },
  { name: "Salomon Kitoko", last: "Kitoko", years: "Pro", note: "Monté de l'école amateur de la maison jusqu'au professionnel.", img: "/assets/img/bc/cutouts/salomon-kitoko.webp" },
  { name: "Elyasse Azap", last: "Azap", years: "Pro", note: "Pur produit de l'école amateur des Minimes.", img: "/assets/img/bc/cutouts/elyasse-azap.webp" },
];

export const VALUES = [
  { n: "01", t: "L'humilité d'abord", d: "Le premier round te dit qui tu es. Tout le monde repart corrigé — les pros aussi." },
  { n: "02", t: "La transmission", d: "Ceux qui tiennent les pattes aujourd'hui ont pris des jabs sur ce ring hier." },
  { n: "03", t: "Le travail", d: "Pas de raccourci. Le talent, c'est dix ans de pattes d'ours." },
  { n: "04", t: "La maison", d: "Le môme de 3 ans et le pro se changent dans le même vestiaire. Personne n'a de couloir privé." },
];

export const AUDIENCES = [
  { t: "Les débutants", tag: "Première fois", d: "Jamais mis un gant ? C'est exactement pour toi. Le coach te met en garde, corrige, recommence — dix fois s'il le faut.", img: "/assets/img/bc/training-1.webp" },
  { t: "Les femmes", tag: "Boxing Lady", d: "Boxing Lady le lundi et le mercredi 18h30 : la salle est à elles. Et tous les cours mixtes te sont ouverts.", img: "/assets/img/bc/lady-1.webp" },
  { t: "Les enfants", tag: "Dès 3 ans", d: "Baby Boxe dès 3 ans, éducative 7/11, ados 12/16 : de la discipline, du respect, et toute cette énergie qui trouve enfin où aller. Le ring qui construit des enfants debout.", img: "/assets/img/bc/educative-1.webp" },
  { t: "Les compétiteurs", tag: "Le ring", d: "Trois rings, du sparring qui pique, des coachs qui ont combattu avant de coacher. On t'amène au combat, prêt à cogner.", img: "/assets/img/bc/anglaise-2.webp" },
];

/* L'offre — teaser accueil (3 cartes). Le détail vit sur /tarifs/ (PROMOS).
   Essai + enfants pointent vers box-plus ; la carte saison reste interne → /tarifs/. */
export const TARIFS = [
  {
    name: "Séance d'essai",
    price: "10€",
    period: "la séance",
    feature: "Toutes disciplines, sans engagement",
    items: ["Gants et protections prêtés", "Toutes les disciplines", "Sans engagement, sans dossier"],
    cta: "Réserver",
    href: "https://box-plus.vercel.app/seance-essai",
    highlight: false,
  },
  {
    name: "La saison",
    price: "259€",
    period: "les 12 mois",
    feature: "Payable en 4× sans frais, accès libre aux 5 clubs",
    items: ["4× sans frais", "Accès libre aux 5 clubs du réseau", "Duo 29€/pers : voir le détail"],
    cta: "Voir l'offre",
    href: "/tarifs/",
    highlight: true,
  },
  {
    name: "Boxe Éducative",
    price: "dès 280€",
    period: "/ an",
    feature: "Enfants & ados, dès 3 ans",
    items: ["Baby Boxe, éducative, ados", "Deux créneaux par semaine", "Matériel fourni"],
    cta: "Inscrire mon enfant",
    href: "https://box-plus.vercel.app/abonnements#enfants",
    highlight: false,
  },
];

/* Le Club — histoire (timeline scroll)
   ⚠ jalons à affiner avec le club. Les entrées non confirmées sont
   volontairement DÉ-DATÉES (`y` textuel) plutôt que datées au jugé :
   un millésime faux est pire qu'un millésime absent, et une timeline qui
   s'arrête il y a deux ans raconte une salle qui s'est arrêtée. */
export const TIMELINE = [
  { y: "2016", t: "Le point de départ", d: "Boxing Center ouvre sa toute première salle aux Minimes. Le concept des salles américaines, accès six jours sur sept, trois rings : un quartier qui n'avait rien, et d'un coup une salle." },
  { y: "2018", t: "Les premiers gants", d: "La boxe éducative et le Boxing Lady décollent. Une génération de gamins et de femmes du quartier découvre le noble art." },
  { y: "Le cap", t: "Le passage pro", d: "Johnson et Salomon passent professionnels. La preuve que l'école des Minimes mène loin." },
  { y: "Depuis", t: "Le vivier", d: "Une trentaine de combattants formés à la maison, et une nouvelle génération qui monte sur le ring chaque saison." },
  { y: "Aujourd'hui", t: "Le berceau", d: "Toujours la même salle, toujours les trois rings. L'école continue de forger." },
];

export const SPECS = [
  { l: "Rings de boxe", v: "3" },
  { l: "Sacs lourds", v: "12" },
  { l: "Zone pattes d'ours", v: "Oui" },
  { l: "Prépa physique (étage)", v: "Oui" },
  { l: "Vestiaires", v: "H / F" },
  { l: "Affiliations", v: "FFBoxe · FFKMDA · FMMAF" },
];

/* Le réseau Boxing Center (liens sortants depuis Minimes).
   §0.9 : domaines cibles = <salle>.boxingcenter.fr. Tant qu'une salle n'a
   pas SON domaine en ligne, le libellé dit la vérité sur la destination
   (`go`) — un bouton « Découvrir » qui atterrit sur la home du groupe ment.
   §0.6 : Balma-Gramont est VENDUE — ne jamais la citer. */
export const NETWORK = [
  { id: "portet", name: "Portet-sur-Garonne", flagship: true, tag: "Le vaisseau amiral", feat: "800 m² · ring olympique · cage MMA", url: "https://www.boxing-center-portet.fr/", go: "Découvrir" },
  { id: "etats-unis", name: "États-Unis", tag: "Le colosse", feat: "La plus grande salle de France dédiée aux sports de combat", url: "https://boxingcenter.fr/", go: "Voir sur boxingcenter.fr" },
  { id: "saint-cyprien", name: "Saint-Cyprien", tag: "Rive gauche", feat: "1 200 m² · toutes disciplines", url: "https://boxingcenter.fr/", go: "Voir sur boxingcenter.fr" },
  { id: "ramonville", name: "Ramonville", tag: "L'octogone", feat: "Ring + octogone 7 m · extérieur", url: "https://boxingcenter.fr/", go: "Voir sur boxingcenter.fr" },
];

/* La FAQ CANONIQUE du site — rendue sur /contact/ UNIQUEMENT, et miroir
   exact du FAQPage LD-JSON de cette page (STANDARDS §4 : FAQPage sur
   /contact/). ⚠ Ne pas la re-rendre ailleurs : deux URL indexées avec les
   mêmes six réponses = duplicate content.
   Voix : tutoiement, bouche du coach — jamais de vouvoiement corporate. */
export const FAQ = [
  { q: "Où se trouve Boxing Center Minimes ?", a: "Au 12 rue de Fenouillet, 31200 Toulouse, dans le quartier des Minimes — Barrière de Paris, à 3 minutes du métro ligne B." },
  { q: "Je n'ai jamais boxé. Je peux venir ?", a: "Oui. Tu ne seras ni le premier ni le seul — on a des créneaux débutants et du cardio boxing où tu ne prends aucun coup. Tu apprends le geste avant de le recevoir." },
  { q: "Quelle est la spécialité de la salle des Minimes ?", a: "La boxe anglaise. C'est la salle historique du groupe, le berceau de plusieurs boxeurs professionnels et amateurs — avec trois rings dédiés." },
  { q: "Y a-t-il des cours pour les enfants ?", a: "Oui, dès 3 ans. Baby Boxe pour les 3/6 ans, boxe éducative pour les 7/11, ados 12/16, puis compétiteurs — du jeu au ring, un créneau par âge. À partir de 280 € l'année." },
  { q: "Il y a des cours pour les femmes ?", a: "Le Boxing Lady est 100 % féminin : lundi 18h30 avec Chloé, mercredi 18h30 avec David. Et tous les autres cours te sont ouverts." },
  { q: "Quels sont les horaires ?", a: "Du lundi au samedi, de 10h00 à 21h30. Fermé le dimanche." },
];

/* Les questions d'ARGENT — /tarifs/ seulement. La page listait quatre prix
   et s'arrêtait là : le visiteur repartait avec les objections intactes
   (« 29€ à deux ou chacun ? », « 259€ d'un coup ? », « je dois acheter des
   gants ? »). Chaque réponse ci-dessous est DÉRIVÉE de PROMOS/LINKS —
   aucun chiffre nouveau, aucune promesse que la boutique ne tient pas.
   ⚠ Rendues en accordéon SANS FAQPage : la seule FAQPage du site est
   celle de /contact/ (§4). Deux FAQPage = deux URL en concurrence. */
export const MONEY_FAQ = [
  {
    q: "Je paye combien pour la première fois ?",
    a: "Dix euros. Une séance d'essai, la discipline que tu veux, gants et protections prêtés. Pas de dossier, pas de certificat à courir chercher avant d'avoir essayé, rien derrière. Tu viens, tu boxes, tu décides après.",
  },
  {
    q: "Le Duo à 29€, c'est pour deux ou chacun ?",
    a: "Chacun. 29€ par personne au lieu de 44€, pour quatre semaines de cours illimités à deux. On ne le vend pas moins cher pour faire joli : le binôme, c'est ce qui te fait pousser la porte la troisième semaine, quand la motivation du début est retombée.",
  },
  {
    q: "259€ d'un coup, c'est raide.",
    a: "C'est pour ça que c'est payable en 4× sans frais. 259€ les douze mois au lieu de 400€, ça fait moins de 65€ par échéance et à peu près 22€ par mois de salle. Un abonnement de sport classique te coûte ça sans ring dedans.",
  },
  {
    q: "L'abonnement marche dans les autres salles ?",
    a: "Oui. La saison ouvre l'accès libre aux cinq clubs du réseau. Tu t'entraînes aux Minimes le soir et ailleurs le samedi si ça t'arrange — c'est la même carte.",
  },
  {
    q: "Et pour inscrire un enfant ?",
    a: "À partir de 280€ l'année, dès 3 ans. Baby Boxe pour les 3/6, éducative pour les 7/11, ados 12/16, puis les jeunes compétiteurs. Un créneau par âge, le mercredi et le samedi.",
  },
  {
    q: "Il faut acheter du matériel avant de venir ?",
    a: "Pas pour l'essai : les gants et les protections sont prêtés. Le jour où tu t'installes, tu prends tes gants à toi — c'est une question d'hygiène avant d'être une question de style. La boutique du réseau est là pour ça, et le coach te dira quoi prendre plutôt que de te vendre le plus cher.",
  },
  {
    q: "Le t-shirt offert, c'est un piège ?",
    a: "Non, c'est un t-shirt. Offert aux cent premiers inscrits de la saison. Quand il n'y en a plus, il n'y en a plus — on ne rallonge pas la liste pour te faire signer.",
  },
];

/* Les questions du LIEU — /le-club/ seulement. Volontairement DIFFÉRENTES
   de la FAQ canonique (/contact/) : ici on répond sur la salle, pas sur
   l'offre. Rendues en prose, sans FAQPage (une seule FAQPage par site). */
export const CLUB_QUESTIONS = [
  { q: "C'est quoi, l'étage ?", a: "La zone prépa physique. Gainage, cardio, explosivité — la caisse qui te fait tenir le dernier round. Elle surplombe les rings : tu bosses en entendant le cuir en dessous." },
  { q: "Je peux venir voir avant ?", a: "Pousse la porte aux heures d'ouverture, du lundi au samedi. Personne ne te demandera rien. Regarde un cours depuis le bord du ring, et tu sauras." },
  { q: "Il y a un vestiaire femme ?", a: "Oui, vestiaires hommes et femmes séparés. Et deux soirs par semaine, le Boxing Lady : la salle est à elles." },
];

/* =====================================================================
   LES COACHS — roster Minimes VÉRIFIÉ (source : roster.json, 2026-07-12).
   Loi §0.10 : nom ≡ photo, jamais croisés, jamais de stock.
   - Mehdi B = Mehdi Boutlelis → photo PROUVÉE (le cutout coach-mehdi.png
     est la même prise que mehdi-boutlelis.webp du scrape officiel). Pilier.
   - Chloé / David / Hicham : AUCUNE photo prouvée → tuiles nom N&B
     (monogramme + discipline), pas de silhouette empruntée, pas de stock.
   Les textes ne décrivent QUE ce que le poster prouve (disciplines/créneaux) ;
   aucun palmarès inventé.
   ===================================================================== */
export const COACHES = {
  pillar: {
    name: "Mehdi B.",
    /* clé de jointure avec PLANNING.coach — le poster écrit « MEHDI B »
       sans point, la page écrit « Mehdi B. » avec. Sans ce champ, le
       compte de créneaux et le lien filtré tombent silencieusement à
       zéro : exactement le genre de bug qui ne casse rien et ment. */
    planName: "Mehdi B",
    role: "Coach principal",
    tag: "Le patron de la maison",
    img: "/assets/img/bc/cutouts/coach-mehdi.webp",
    bigname: "Mehdi",
    disciplines: ["Boxe anglaise", "Boxe éducative", "Compétiteurs", "Baby Boxe", "Boxing camp", "Open sparring"],
    bio: "Il tient l'école du premier gant de Baby Boxe jusqu'au sparring des compétiteurs. Anglaise loisirs, éducative, compétition, boxing camp : c'est lui qui trace la ligne. Le genre de coach qui te reprend le jab dix fois s'il le faut — et qui te lâche jamais avant que tu l'aies rentré.",
    note: "Présent presque tous les créneaux de la semaine, du lundi au samedi.",
  },
  roster: [
    { initials: "C", name: "Chloé", planName: "Chloé", role: "Boxing Lady", note: "Le Boxing Lady du lundi soir, de 18h30 à 19h30. Elle mène la bande et elle ne lâche rien." },
    { initials: "D", name: "David", planName: "David", role: "Boxing Lady · Pieds-poings", note: "Le Lady du mercredi 18h30, puis les pieds-poings à 19h40 dans la foulée. Le geste propre, la garde haute." },
    { initials: "H", name: "Hicham", planName: "Hicham", role: "Boxing camp", note: "Le boxing camp du mardi et du jeudi, 18h30. Le cardio qui te construit une caisse." },
  ],
  /* honnêteté §0.10 : on assume publiquement l'absence de portrait */
  pending: "Chloé, David et Hicham rejoindront le mur dès qu'on aura leur vrai portrait. Pas de photo d'illustration : ici, un visage = la bonne personne.",
};

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
