import { SITE, ROUTES, BUILT } from "../routes.mjs";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
  const urls = ROUTES.map((r) => `  <url>
    <loc>${SITE}${r.path}</loc>
    <lastmod>${BUILT}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
    <image:image>
      <image:loc>${SITE}${r.image}</image:loc>
      <image:title>${esc(r.caption)}</image:title>
    </image:image>
  </url>`).join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Boxing Center Minimes — fabriqué au build depuis src/routes.mjs.
     Les 8 routes de nav sont en ligne (0 lien 404). <lastmod> = date de
     publication réelle. <image:image> = la photo principale de la page.
     /admin/ et /api/ n'y figurent pas : ils ne s'indexent pas. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
