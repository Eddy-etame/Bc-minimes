/* =====================================================================
   Le contenu éditable du site — API du backoffice.
     GET  /api/admin/content  → src/content.json (+ sha)        [admin]
     POST /api/admin/content  → valide, commite sur GitHub,
                                déclenche la reconstruction Vercel  [admin]
   Variables : ADMIN_TOKEN, GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH
   (main par défaut), VERCEL_DEPLOY_HOOK (facultatif mais recommandé).
   ===================================================================== */
import { allowCors, isAdmin, body, gh, GH_REPO, GH_BRANCH, siteContent } from "../_lib/util.js";

const PATH = "src/content.json";
const TOP_KEYS = ["salle", "promos", "coaches", "planning", "faq"];

export default async function handler(req, res) {
  allowCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (!isAdmin(req))
    return res.status(401).json({ error: process.env.ADMIN_TOKEN ? "Unauthorized" : "ADMIN_TOKEN non configuré." });

  /* --- lecture --- */
  if (req.method === "GET") {
    if (!process.env.GITHUB_TOKEN || !GH_REPO) {
      // Pas de dépôt branché : on sert quand même le contenu déployé, en
      // lecture seule. Le backoffice le dit clairement au lieu de rester
      // sur un écran vide.
      const content = siteContent();
      if (!content) return res.status(500).json({ error: "src/content.json illisible." });
      return res.status(200).json({ content, readOnly: true, why: "GITHUB_TOKEN ou GITHUB_REPO non configuré : lecture seule." });
    }
    const r = await gh(`contents/${PATH}?ref=${GH_BRANCH}`);
    if (!r.ok) return res.status(502).json({ error: "Lecture GitHub échouée (" + r.status + ")" });
    const j = await r.json();
    const content = JSON.parse(Buffer.from(j.content, "base64").toString("utf8"));
    return res.status(200).json({ content, sha: j.sha });
  }

  /* --- publication --- */
  if (req.method === "POST") {
    if (!process.env.GITHUB_TOKEN || !GH_REPO)
      return res.status(500).json({ error: "GITHUB_TOKEN ou GITHUB_REPO non configuré : publication impossible." });

    const content = body(req).content;
    if (!content || typeof content !== "object" || Array.isArray(content))
      return res.status(400).json({ error: "Contenu invalide." });
    if (!TOP_KEYS.some((k) => k in content))
      return res.status(400).json({ error: "Structure de contenu inattendue." });

    const json = JSON.stringify(content, null, 2);
    if (json.length > 400_000) return res.status(413).json({ error: "Contenu trop volumineux." });

    const cur = await gh(`contents/${PATH}?ref=${GH_BRANCH}`);
    const sha = cur.ok ? (await cur.json()).sha : undefined;

    const put = await gh(`contents/${PATH}`, {
      method: "PUT",
      body: JSON.stringify({
        message: "contenu : mise à jour depuis le vestiaire",
        content: Buffer.from(json + "\n", "utf8").toString("base64"),
        branch: GH_BRANCH,
        sha,
      }),
    });
    if (!put.ok) return res.status(502).json({ error: "Écriture GitHub échouée (" + put.status + ")" });

    let rebuild = false;
    if (process.env.VERCEL_DEPLOY_HOOK) {
      try { await fetch(process.env.VERCEL_DEPLOY_HOOK, { method: "POST" }); rebuild = true; } catch {}
    }
    return res.status(200).json({ ok: true, rebuild });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
