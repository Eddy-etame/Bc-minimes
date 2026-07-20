# Boxing Center Minimes

Site vitrine de la salle Boxing Center Minimes (Toulouse, Barrière de Paris — 31200).
Projet Astro statique : 8 pages + page 404, fidèle à la maquette d'origine au pixel près.
S'y ajoutent trois fonctions serverless (assistant IA, carnet de contacts, backoffice).

## Commandes

```bash
npm install        # installer les dépendances
npm run dev        # serveur de développement (http://localhost:4321)
npm run build      # build de production dans dist/
npm run preview    # prévisualiser le build

# vérifier le site ET les fonctions ensemble, en local :
node scripts/serve-local.mjs 6902     # sert dist/ + les vrais handlers de api/
```

`astro dev` ne sait pas exécuter les fonctions de `api/` : en développement,
l'assistant tombera donc sur son repli hors-ligne. `scripts/serve-local.mjs`
sert le build ET importe les vrais fichiers de `api/` — c'est le seul moyen
local de vérifier la chaîne complète sans déployer.

## Structure

- `src/pages/` — les pages (HTML de la maquette, scripts et styles inline préservés)
- `src/content.json` — **le contenu modifiable depuis le backoffice** (salle, offres, coachs, planning, questions)
- `src/components/SiteContent.astro` — injecte dans chaque page l'écart entre `content.json` et les défauts de `data.js`
- `public/assets/js/data.js` — la source de vérité du contenu ; la fusion du contenu publié se fait à la fin du fichier
- `public/assets/js/chatbot.js` — le widget conversationnel
- `public/admin/` — le backoffice « Le coin rouge » (hors routage Astro)
- `api/` — les fonctions serverless (Vercel les sert à côté du build statique)

---

## L'assistant du site (`/api/chat`)

Le widget se greffe sur la pastille rouge déjà présente dans le HTML. **Sans
JavaScript, cette pastille reste un lien `tel:` qui appelle la salle** ; le
script la promeut en conversation. Il n'y a donc jamais de bouton mort.

Le prompt système est ancré sur les vraies données de la salle, lues dans
`src/content.json` (adresse, horaires, offres, coachs, planning), avec un repli
statique figé si le fichier devient illisible.

Cascade de fournisseurs, dans l'ordre :

1. **Gemini** — toutes les variables commençant par `GEMINI_API_KEY` forment un
   pool ; elles sont mélangées et les clés mortes sont sautées.
   Modèle réglable par `GEMINI_MODEL` (défaut `gemini-2.5-flash`).
2. **Groq** — `GROQ_API_KEY`, `GROQ_MODEL` (défaut `llama-3.3-70b-versatile`).
3. **Mistral** — `MISTRAL_API_KEY`, `MISTRAL_MODEL` (défaut `mistral-small-latest`).
4. **La base de connaissance locale** — si aucune clé n'est configurée, ou si
   toutes échouent, la fonction répond quand même (200) depuis les faits de la
   salle codés dans `api/chat.js`. L'assistant perd la conversation libre, pas
   son utilité. Aucune page morte, jamais.

### La capture de contacts

Le widget extrait au fil de la conversation, sans jamais interroger de force :

| Ce que le visiteur écrit | Ce qui est capté |
| --- | --- |
| « Salut, moi c'est Karim » | `prenom` |
| « mon numéro c'est 06 12 34 56 78 » | `phone` |
| « karim@mail.com » | `email` |
| « je viens de Ramonville » | `salle` |

Le prénom est aussi capté en un seul mot quand le bot vient de le demander
(drapeau `expectName`). Dès qu'on a un moyen de recontact (email **ou**
téléphone), le lead part vers `/api/lead`. Une signature anti-doublon évite les
envois répétés ; un profil enrichi (le téléphone puis l'email) repart une fois,
complété. Après deux échanges sans coordonnées, le bot propose **une seule
fois**, gentiment, de laisser un contact.

## Le carnet de contacts (`/api/lead`)

Trois voies, cumulables, toutes optionnelles :

| Variables | Effet |
| --- | --- |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` (ou `UPSTASH_REDIS_REST_*`) | **Stockage** : le lead est relisible dans le backoffice, section « Les contacts ». 500 derniers gardés. |
| `RESEND_API_KEY` (+ `LEAD_EMAIL_TO`, `LEAD_EMAIL_FROM`) | Un email part à chaque contact. `LEAD_EMAIL_TO` vaut `boxingcenter31@gmail.com` par défaut. |
| `LEAD_WEBHOOK_URL` | Un POST JSON (Zapier, Make, Google Sheets…). |

**Rien de configuré ?** La fonction répond quand même `200` et journalise le
lead dans les logs Vercel. Le parcours du visiteur n'est jamais cassé par un
secret manquant. Le backoffice, lui, affiche franchement ce qu'il manque à
brancher au lieu d'un tableau vide qui mentirait.

Voie recommandée pour démarrer : **Vercel KV** (gratuit, deux variables, aucune
dépendance npm) + **Resend** pour recevoir l'alerte par email.

## Le backoffice — « Le coin rouge » (`/admin/`)

Protégé par `ADMIN_TOKEN`, vérifié **côté fonction** : aucun secret ne vit dans
le front, le mot de passe saisi n'est qu'un en-tête `x-admin-token` que le
serveur compare en temps constant.

Il permet d'éditer la salle, les offres, les coachs, le planning et les
questions, puis de **publier** : commit de `src/content.json` sur GitHub, ce qui
déclenche une reconstruction Vercel. « Aperçu » ouvre `/?apercu=1`, qui affiche
le site avec le brouillon local — **rien n'est en ligne tant qu'on n'a pas
publié**.

Une visite guidée se lance au premier passage, et quatre assistants pas à pas
(changer les horaires, modifier un prix, ajouter un créneau, voir les contacts)
guident geste par geste : ils assombrissent l'écran sauf la cible, et attendent
le vrai clic de l'utilisateur au lieu d'un bouton « Suivant ».

| Variables | Rôle |
| --- | --- |
| `ADMIN_TOKEN` | Le mot de passe du staff. **Obligatoire**, sinon l'accès est refusé (aucune porte ouverte par défaut). |
| `GITHUB_TOKEN`, `GITHUB_REPO` | La publication. Sans eux, le backoffice passe en **lecture seule** et le dit. |
| `GITHUB_BRANCH` | `main` par défaut. |
| `VERCEL_DEPLOY_HOOK` | Déclenche la reconstruction après publication (recommandé). |

## Déploiement

Importer le repo dans Vercel — le framework Astro est détecté automatiquement,
et le dossier `api/` est servi en fonctions serverless à côté du build statique.

`vercel.json` porte les en-têtes de sécurité (HSTS, CSP, X-Frame-Options,
Referrer-Policy, Permissions-Policy, X-Content-Type-Options), les durées de
cache par type d'asset (polices immuables un an, images et vidéos 30 jours avec
revalidation en arrière-plan), le `no-store` sur `/api/` et le `noindex` sur
`/admin/`.

---

## Mise en ligne (Vercel)

1. **Importer** — Vercel → *Add New Project* → importe `Bc-minimes`. Le framework (Astro) est détecté tout seul : rien à configurer.
2. **Variables d'environnement** — copie celles de [`.env.example`](.env.example) dans *Settings → Environment Variables*. Toutes sont facultatives : sans elles le site tourne, en mode dégradé honnête (l'assistant répond depuis sa base locale, les contacts partent dans les logs, le vestiaire explique ce qui lui manque au lieu de casser).
3. **Domaine** — branche `minimes.boxingcenter.fr` dans *Settings → Domains*.
4. **Vérifier les en-têtes** — une fois en ligne : `curl -I https://minimes.boxingcenter.fr` doit montrer `strict-transport-security`, `x-content-type-options`, `x-frame-options`, `referrer-policy`, `permissions-policy` et `content-security-policy`. Ils ne s'activent que sur Vercel, jamais en local.

### La boutique
Les liens boutique pointent vers **`https://box-plus.vercel.app/`** (la nouvelle boutique Box-Plus).
Le jour où le domaine payant est en place, il n'y a qu'UN endroit à changer : `LINKS.boutique`
dans `public/assets/js/data.js` — tout le site, le maillage et le JSON-LD suivent.

### Sécurité
`.env` est ignoré par git ; aucun secret n'est présent dans le dépôt (vérifié). Les clés vivent
uniquement dans les variables d'environnement Vercel, jamais dans le front : l'admin s'authentifie
côté serverless, en comparaison à temps constant.
