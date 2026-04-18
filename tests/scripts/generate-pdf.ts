/**
 * Generate PDF from HTML using Playwright's PDF engine
 * DTI Region 7 EMS
 *
 * Usage: npx tsx scripts/generate-pdf.ts
 */

import { chromium } from '@playwright/test';
import * as path from 'path';
import * as fs   from 'fs';

const DOCS_DIR  = path.join(__dirname, '../../docs');
const IN_HTML   = path.join(DOCS_DIR, 'EMS-TEST-MANUAL.html');
const OUT_PDF   = path.join(DOCS_DIR, 'EMS-TEST-MANUAL.pdf');

async function main() {
  if (!fs.existsSync(IN_HTML)) {
    console.error(`❌  HTML file not found: ${IN_HTML}`);
    console.error('    Run "pnpm manual:html" first.');
    process.exit(1);
  }

  console.log('🌐  Launching headless Chromium for PDF generation…');
  const browser = await chromium.launch();
  const page    = await browser.newPage();

  await page.goto(`file://${IN_HTML}`, { waitUntil: 'networkidle' });

  await page.pdf({
    path:              OUT_PDF,
    format:            'Letter',
    printBackground:   true,
    margin:            { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size:9px;font-family:sans-serif;color:#666;width:100%;text-align:right;padding-right:1.5cm;">
        DTI Region 7 EMS — Test Plan &amp; UAT Evidence Book
      </div>`,
    footerTemplate: `
      <div style="font-size:9px;font-family:sans-serif;color:#666;width:100%;text-align:center;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>`,
  });

  await browser.close();

  const size = (fs.statSync(OUT_PDF).size / 1024).toFixed(0);
  console.log(`✅  PDF generated → ${path.relative(process.cwd(), OUT_PDF)}  (${size} KB)`);
}

main().catch((err) => {
  console.error('PDF generation failed:', err);
  process.exit(1);
});
