// Export every slide to PNG + a 16:9 PDF, from a running Slidev server.
// Usage: NODE_PATH=<dir containing playwright> node scripts/export.cjs [baseUrl] [count] [outDirName=export]
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { chromium } = require("playwright");

(async () => {
  const base = (process.argv[2] || "http://localhost:3030").replace(/\/$/, "");
  const count = Number(process.argv[3] || 20);
  const deckDir = path.resolve(__dirname, "..");
  const outDir = path.join(deckDir, process.argv[4] || "export");
  const pngDir = path.join(outDir, "png");
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(pngDir, { recursive: true });

  const browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
  const files = [];
  for (let i = 1; i <= count; i++) {
    await page.goto(`${base}/${i}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForSelector(`.slidev-page-${i} .slidev-layout`, { timeout: 15000 });
    await page.waitForTimeout(1250);
    const f = path.join(pngDir, `p${String(i).padStart(2, "0")}.png`);
    await page.screenshot({ path: f });
    files.push(f);
  }

  const html = `<html><head><style>@page{size:1920px 1080px;margin:0}body{margin:0;background:#000}img{width:1920px;height:1080px;display:block;page-break-after:always}</style></head><body>${files
    .map(f => `<img src="file://${f}"/>`)
    .join("")}</body></html>`;
  const htmlPath = path.join(outDir, "pdf.html");
  fs.writeFileSync(htmlPath, html);
  const pdfPage = await browser.newPage();
  await pdfPage.goto(`file://${htmlPath}`, { waitUntil: "load" });
  await pdfPage.pdf({ path: path.join(outDir, "slides.pdf"), width: "1920px", height: "1080px", printBackground: true });
  fs.rmSync(htmlPath);
  await browser.close();

  execSync(`cd ${pngDir} && zip -q -r ../slides-png.zip .`);
  console.log(`exported ${files.length} slides → ${outDir}`);
})();
