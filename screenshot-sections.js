const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const OUT = '/tmp/drct-sections';
fs.mkdirSync(OUT, { recursive: true });

const selectors = [
  'hero',       '.info',
  'advantages', '.advantages',
  'terminal',   '.how',
  'savings',    '.savings',
  'one-place',  '.one-place',
  'benefits',   '.benefits',
  'faq',        '.questions',
  'certified',  '.certified',
  'footer',     '.footer',
];

async function shotSections(page, prefix) {
  for (let i = 0; i < selectors.length; i += 2) {
    const name = selectors[i];
    const sel  = selectors[i + 1];
    try {
      const el = await page.$(sel);
      if (!el) continue;
      const box = await el.boundingBox();
      if (!box || box.width === 0 || box.height === 0) continue;
      await page.screenshot({
        path: path.join(OUT, `${prefix}-${name}.png`),
        clip: { x: box.x, y: box.y, width: box.width, height: Math.min(box.height, 2000) },
      });
    } catch (e) { /* skip invisible */ }
  }
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox','--disable-dev-shm-usage'] });

  const dCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const dPage = await dCtx.newPage();
  await dPage.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 15000 });
  await dPage.waitForTimeout(800);
  await shotSections(dPage, 'desktop');
  await dCtx.close();

  const mCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
  const mPage = await mCtx.newPage();
  await mPage.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 15000 });
  await mPage.waitForTimeout(800);
  await shotSections(mPage, 'mobile');
  await mCtx.close();

  await browser.close();
  console.log('done');
  console.log(fs.readdirSync(OUT).join('\n'));
})();
