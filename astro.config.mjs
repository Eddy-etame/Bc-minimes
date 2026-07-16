import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://minimes.boxingcenter.fr',
  trailingSlash: 'always',
  compressHTML: false,
  build: { format: 'directory' },
  devToolbar: { enabled: false }
});
