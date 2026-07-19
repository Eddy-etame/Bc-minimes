import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://minimes.boxingcenter.fr',
  trailingSlash: 'always',
  /* Le HTML sort compressé : ~2 ko brut de blancs par page, sur 9 pages,
     pour zéro perte à l'écran. Les blocs <script>/<pre> ne sont pas
     touchés par Astro, la lisibilité du source reste dans src/. */
  compressHTML: true,
  build: { format: 'directory' },
  devToolbar: { enabled: false }
});
