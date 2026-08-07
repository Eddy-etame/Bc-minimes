import { SITE, ROUTES, BUILT } from "../routes.mjs";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
  const urls = ROUTES.map((r) => `  <url>
    <loc>${SITE}${r.path}</loc>
    <lastmod>${BUILT}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
${r.images.map(([src, titre, legende]) => `    <image:image>
      <image:loc>${SITE}${src}</image:loc>
      <image:title>${esc(titre)}</image:title>
      <image:caption>${esc(legende)}</image:caption>
    </image:image>`).join("\n")}
  </url>`).join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Boxing Center Minimes — fabriqué au build depuis src/routes.mjs.
     Les 8 routes de nav sont en ligne (0 lien 404). <lastmod> = date de
     publication réelle. <image:image> = TOUTES les photos que la page
     montre, titrées et légendées : elles vivent en fonds CSS, donc seule
     cette déclaration les rend visibles de Google Images.
     /admin/ et /api/ n'y figurent pas : ils ne s'indexent pas. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
