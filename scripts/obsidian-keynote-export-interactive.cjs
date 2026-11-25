// Export the 4-page interactive sales deck into a print/WeChat-friendly 9-page 16:9 PDF:
//   p01: Slide 1 (all 3 real scenes brightly lit)
//   p02: Slide 2 (all 4 real scenes brightly lit)
//   p03..p08: Slide 3 unfolded across all 6 iPhone screens (Step 01 → Step 06)
//   p09: Slide 4 live demo showcase with real clickable PDF links (`.ld-pdf-link`, e.g. https://demo.example.com/)
// Usage: NODE_PATH=<dir containing playwright> node scripts/obsidian-keynote-export-interactive.cjs [baseUrl] [outDirName=export-sales]
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { chromium } = require("playwright");

(async () => {
  const base = (process.argv[2] || "http://localhost:3041").replace(/\/$/, "");
  const deckDir = path.resolve(__dirname, "..");
  const outDir = path.join(deckDir, process.argv[3] || "export-sales");
  const pngDir = path.join(outDir, "png");
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(pngDir, { recursive: true });

  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
  const files = [];

  // Helper: reveal all carousel cards cleanly for static PDF readability
  const pdfLitCss = `
    .cc-rich .cc-card.is-dim { opacity: 1 !important; transform: none !important; border-color: rgba(255,255,255,0.12) !important; }
    .cc-rich .cc-card.is-dim .cc-photo { filter: brightness(0.95) saturate(1.02) !important; }
    .cc-rich .cc-card.is-dim .hud-pill.is-warn { background: rgba(255,105,0,0.88) !important; border-color: rgba(255,180,120,0.55) !important; color: #fff !important; }
    .cc-card.is-active { transform: none !important; box-shadow: 0 12px 28px rgba(0,0,0,0.6) !important; border-color: rgba(255,255,255,0.12) !important; background: rgba(255,255,255,0.025) !important; }
    .cc-card.is-active .cc-title { color: #ffffff !important; }
    .cc-bar { display: none !important; }
  `;

  // Slide 1 & Slide 2 (all real-scene cards brightly visible for static PDF)
  for (const slideNum of [1, 2]) {
    await page.goto(`${base}/${slideNum}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForSelector(`.slidev-page-${slideNum} .cc-card`, { timeout: 15000 });
    await page.addStyleTag({ content: pdfLitCss });
    await page.waitForTimeout(900);
    const f = path.join(pngDir, `p0${slideNum}.png`);
    await page.screenshot({ path: f });
    files.push({ file: f, links: [] });
  }

  // Slide 3: unfold all interactive iPhone step screens (Step 01 → Step N)
  await page.goto(`${base}/3`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForSelector(".slidev-page-3 .st-tile", { timeout: 15000 });
  await page.waitForTimeout(800);
  const tiles = await page.locator(".slidev-page-3 .st-tile").all();
  for (let i = 0; i < tiles.length; i++) {
    await tiles[i].click();
    await page.waitForTimeout(550);
    const f = path.join(pngDir, `p0${i + 3}.png`);
    await page.screenshot({ path: f });
    files.push({ file: f, links: [] });
  }

  // Slide 4: live demo page with clickable PDF link hotspots
  await page.goto(`${base}/4`, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForSelector(".slidev-page-4 .ld-browser", { timeout: 15000 });
  await page.waitForTimeout(700);
  const s4Links = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".slidev-page-4 .ld-pdf-link")).map((a) => {
      const r = a.getBoundingClientRect();
      return { href: a.getAttribute("href"), x: r.left, y: r.top, w: r.width, h: r.height };
    })
  );
  const f4 = path.join(pngDir, "p09.png");
  await page.screenshot({ path: f4 });
  files.push({ file: f4, links: s4Links });

  // Assemble exact 16:9 PDF from PNGs (with real clickable PDF links on Slide 4)
  const pdfPage = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const sections = files
    .map(({ file, links }) => {
      const linkTags = links
        .map(
          (l) =>
            `<a href="${l.href}" style="position:absolute;left:${l.x}px;top:${l.y}px;width:${l.w}px;height:${l.h}px;display:block;"></a>`
        )
        .join("");
      return `<section><img src="data:image/png;base64,${fs.readFileSync(file).toString("base64")}"/>${linkTags}</section>`;
    })
    .join("");
  await pdfPage.setContent(
    `<!doctype html><style>@page{size:1280px 720px;margin:0}html,body{margin:0;padding:0;background:#000}section{position:relative;width:1280px;height:720px;page-break-after:always;overflow:hidden}section:last-child{page-break-after:auto}img{width:1280px;height:720px;display:block}</style>${sections}`
  );
  await pdfPage.pdf({ path: path.join(outDir, "slides.pdf"), width: "1280px", height: "720px", printBackground: true });
  await browser.close();

  execSync(`zip -qj "${path.join(outDir, "slides-png.zip")}" "${pngDir}"/*.png`);
  console.log(`exported ${files.length} sales PDF pages → ${outDir}`);
})();
