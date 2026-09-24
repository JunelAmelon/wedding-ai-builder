import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { marked } from "marked";
import katex from "katex";

function sanitizeMath(tex: string): string {
  let cleaned = tex.trim();
  // Wrap raw € in \text{€} if not already wrapped
  cleaned = cleaned.replace(/([0-9\s,]+)€/g, "$1\\text{ €}");
  cleaned = cleaned.replace(/€/g, "\\text{€}");
  cleaned = cleaned.replace(/«/g, "\\text{«}");
  cleaned = cleaned.replace(/»/g, "\\text{»}");
  return cleaned;
}

function renderMath(tex: string, displayMode: boolean): string {
  try {
    const cleanTex = sanitizeMath(tex);
    const html = katex.renderToString(cleanTex, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: true,
    });
    if (displayMode) {
      return `<div class="math-block"><div class="math-inner">${html}</div></div>`;
    }
    return `<span class="math-inline">${html}</span>`;
  } catch (err) {
    console.warn("Math rendering error for:", tex, err);
    return `<span class="math-fallback">${tex}</span>`;
  }
}

async function main() {
  const rootDir = process.cwd();
  const mdPath = path.join(rootDir, "CHANGELOG_MODIFICATIONS.md");
  if (!fs.existsSync(mdPath)) {
    console.error("Fichier CHANGELOG_MODIFICATIONS.md introuvable !");
    process.exit(1);
  }

  let markdown = fs.readFileSync(mdPath, "utf-8");

  // Ensure fonts exist in scratch directory
  const scratchDir = path.join(rootDir, "scratch");
  const scratchFontsDir = path.join(scratchDir, "fonts");
  const nodeFontsDir = path.join(rootDir, "node_modules", "katex", "dist", "fonts");

  if (!fs.existsSync(scratchFontsDir) && fs.existsSync(nodeFontsDir)) {
    fs.cpSync(nodeFontsDir, scratchFontsDir, { recursive: true });
  }

  // Load KaTeX CSS
  const katexCssPath = path.join(rootDir, "node_modules", "katex", "dist", "katex.min.css");
  let katexCss = "";
  if (fs.existsSync(katexCssPath)) {
    katexCss = fs.readFileSync(katexCssPath, "utf-8");
  }

  // Pre-process math formulas with KaTeX
  // 1. Block formulas $$ ... $$
  markdown = markdown.replace(/\$\$([\s\S]+?)\$\$/g, (_match, tex) => {
    return renderMath(tex, true);
  });

  // 2. Inline formulas $ ... $
  markdown = markdown.replace(/\$([^\$\n\r]+?)\$/g, (_match, tex) => {
    return renderMath(tex, false);
  });

  // Configure marked renderer for clean anchors and nice badges
  const renderer = new marked.Renderer();

  // Custom table renderer for elegant styling
  renderer.table = function (token: any) {
    if (typeof token === "string") {
      return `<div class="table-container"><table>${token}</table></div>`;
    }
    // Standard marked parser fallback
    return `<div class="table-container">${marked.Renderer.prototype.table.call(this, token)}</div>`;
  };

  marked.setOptions({
    renderer,
    gfm: true,
    breaks: false,
  });

  const contentHtml = marked.parse(markdown);

  const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Journal des Modifications & Évolutions - Wedding AI Builder</title>
  <style>
    /* Inlined KaTeX styles with local fonts */
    ${katexCss}

    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

    @page {
      size: A4;
      margin: 18mm 16mm 20mm 16mm;
      @bottom-right {
        content: "Page " counter(page) " / " counter(pages);
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 8.5pt;
        color: #64748b;
        font-weight: 500;
      }
      @bottom-left {
        content: "Wedding AI Builder — Journal des Évolutions & Spécifications";
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 8.5pt;
        color: #94a3b8;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.65;
      font-size: 10pt;
      margin: 0;
      padding: 0;
    }

    /* Cover / Header Banner */
    .cover-banner {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%);
      color: #ffffff;
      padding: 36px 32px 30px 32px;
      border-radius: 12px;
      margin-bottom: 28px;
      box-shadow: 0 4px 15px rgba(30, 27, 75, 0.15);
      break-inside: avoid;
    }

    .cover-tags {
      display: flex;
      gap: 8px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }

    .cover-tag {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .cover-tag.success {
      background: rgba(34, 197, 94, 0.25);
      border-color: rgba(34, 197, 94, 0.5);
      color: #bbf7d0;
    }

    .cover-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 23pt;
      font-weight: 700;
      margin: 0 0 10px 0;
      line-height: 1.25;
      color: #ffffff;
    }

    .cover-subtitle {
      font-size: 10.5pt;
      color: #cbd5e1;
      margin: 0;
      line-height: 1.5;
    }

    /* Headings */
    h1 {
      display: none; /* Already styled in cover-banner */
    }

    h2 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 13.5pt;
      font-weight: 800;
      color: #1e1b4b;
      background: #f8fafc;
      border-left: 5px solid #4f46e5;
      border-bottom: 1px solid #e2e8f0;
      padding: 10px 14px;
      margin-top: 32px;
      margin-bottom: 14px;
      break-after: avoid;
      border-radius: 0 8px 8px 0;
      display: flex;
      align-items: center;
    }

    h3 {
      font-size: 11pt;
      font-weight: 700;
      color: #334155;
      margin-top: 20px;
      margin-bottom: 8px;
      break-after: avoid;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 4px;
    }

    h4 {
      font-size: 10pt;
      font-weight: 700;
      color: #475569;
      margin-top: 14px;
      margin-bottom: 6px;
      break-after: avoid;
    }

    p {
      margin-top: 0;
      margin-bottom: 10px;
    }

    /* Math Formulas - Premium High Readability */
    .katex {
      font-size: 1.1em;
      color: #1e1b4b;
      font-weight: 600;
    }

    .math-inline {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
      white-space: nowrap;
      display: inline-block;
      vertical-align: middle;
      margin: 0 2px;
    }

    .math-inline .katex {
      font-size: 1.05em;
    }

    .math-block {
      background: #faf5ff;
      border: 1.5px solid #d8b4fe;
      border-left: 5px solid #9333ea;
      border-radius: 8px;
      padding: 14px 20px;
      margin: 16px 0;
      text-align: center;
      break-inside: avoid;
      box-shadow: 0 2px 5px rgba(147, 51, 234, 0.05);
    }

    .math-block .katex {
      font-size: 1.2em;
      color: #581c87;
    }

    /* Callout & Quotes */
    blockquote {
      background-color: #f8fafc;
      border-left: 4px solid #6366f1;
      margin: 12px 0;
      padding: 10px 16px;
      color: #334155;
      font-size: 9.5pt;
      border-radius: 0 8px 8px 0;
    }

    blockquote p:last-child {
      margin-bottom: 0;
    }

    /* Tables */
    .table-container {
      margin: 16px 0;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
      break-inside: avoid;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      margin: 0;
    }

    th {
      background: #f1f5f9;
      color: #0f172a;
      text-align: left;
      font-weight: 700;
      padding: 9px 12px;
      border-bottom: 2px solid #cbd5e1;
      border-right: 1px solid #e2e8f0;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.5px;
    }

    th:last-child {
      border-right: none;
    }

    td {
      padding: 9px 12px;
      border-bottom: 1px solid #e2e8f0;
      border-right: 1px solid #f1f5f9;
      vertical-align: top;
    }

    td:last-child {
      border-right: none;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    tr:last-child td {
      border-bottom: none;
    }

    /* Code & File Links */
    code {
      font-family: 'JetBrains Mono', Consolas, Monaco, monospace;
      font-size: 8.5pt;
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 2px 6px;
      border-radius: 5px;
      border: 1px solid #e2e8f0;
      font-weight: 500;
    }

    pre {
      background-color: #0f172a;
      color: #f8fafc;
      padding: 14px 18px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 14px 0;
      font-size: 8.5pt;
      line-height: 1.5;
      break-inside: avoid;
      border: 1px solid #334155;
    }

    pre code {
      background-color: transparent;
      color: #f8fafc;
      border: none;
      padding: 0;
      font-size: inherit;
    }

    /* Lists */
    ul, ol {
      margin-top: 0;
      margin-bottom: 12px;
      padding-left: 20px;
    }

    li {
      margin-bottom: 5px;
    }

    li > ul {
      margin-top: 4px;
      margin-bottom: 4px;
    }

    hr {
      border: 0;
      height: 1px;
      background: #e2e8f0;
      margin: 26px 0;
    }

    a {
      color: #4f46e5;
      text-decoration: none;
      font-weight: 600;
    }

    /* Print Optimizations */
    @media print {
      body {
        font-size: 9.5pt;
      }
      .math-inline {
        border-color: #cbd5e1;
      }
      pre {
        background-color: #0f172a !important;
        color: #f8fafc !important;
      }
      .cover-banner {
        background: #1e1b4b !important;
        color: #ffffff !important;
      }
    }
  </style>
</head>
<body>
  <div class="cover-banner">
    <div class="cover-tags">
      <span class="cover-tag">Wedding AI Builder</span>
      <span class="cover-tag success">✅ Production Ready (0 erreur)</span>
      <span class="cover-tag">📅 10 Septembre 2026</span>
    </div>
    <div class="cover-title">📋 Journal des Modifications & Architecture Technique</div>
    <div class="cover-subtitle">
      Synthèse exhaustive des résolutions de bugs, fiabilisation des prompts IA, règles de sécurité budgétaire, synchronisation du planning et automatisation des appels d'offres.
    </div>
  </div>

  <div class="content">
    ${contentHtml}
  </div>
</body>
</html>`;

  const htmlPath = path.join(scratchDir, "changelog_print.html");
  fs.writeFileSync(htmlPath, fullHtml, "utf-8");
  console.log("HTML exporté dans :", htmlPath);

  // Convert HTML to PDF using Microsoft Edge headless
  const pdfPath = path.join(rootDir, "CHANGELOG_MODIFICATIONS.pdf");
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

  console.log("Conversion en cours avec Microsoft Edge Headless...");
  const cmd = `"${edgePath}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" --no-pdf-header-footer "file:///${htmlPath.replace(/\\/g, "/")}"`;

  try {
    execSync(cmd, { stdio: "inherit" });
    if (fs.existsSync(pdfPath)) {
      const stats = fs.statSync(pdfPath);
      console.log(`\n🎉 SUCCÈS ! PDF généré avec succès :`);
      console.log(`- Fichier : ${pdfPath}`);
      console.log(`- Taille : ${(stats.size / 1024).toFixed(1)} KB`);
    } else {
      console.error("Le fichier PDF n'a pas été créé.");
    }
  } catch (err) {
    console.error("Erreur lors de l'exécution de Edge:", err);
  }
}

main().catch(console.error);
