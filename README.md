# Boxing Center Minimes

Site vitrine de la salle Boxing Center Minimes (Toulouse, Barrière de Paris — 31200).
Projet Astro statique : 8 pages + page 404, fidèle à la maquette d'origine au pixel près.

## Commandes

```bash
npm install        # installer les dépendances
npm run dev        # serveur de développement (http://localhost:4321)
npm run build      # build de production dans dist/
npm run preview    # prévisualiser le build
```

## Déploiement

Importer le repo dans Vercel — le framework Astro est détecté automatiquement.
Le fichier `vercel.json` porte les en-têtes de sécurité (HSTS, CSP, X-Frame-Options,
Referrer-Policy, Permissions-Policy, X-Content-Type-Options) : ils sont appliqués
par Vercel au moment du déploiement.

## Structure

- `src/pages/` — les pages (HTML de la maquette, scripts et styles inline préservés)
- `public/assets/` — images, vidéos, CSS et JS copiés à l'identique depuis la maquette
- `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt` — fichiers SEO à la racine
