const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const url = process.argv[2];
const outDir = process.argv[3] || '/tmp/drct-prod';
fs.mkdirSync(outDir, { recursive: true });
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--ignore-certificate-errors'],
  });

  // Desktop full page
  const dCtx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const dPage = await dCtx.newPage();
  await dPage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await dPage.waitForTimeout(2000);
  await dPage.screenshot({ path: path.join(outDir, 'desktop.png'), fullPage: true });
  console.log('desktop done');
  await dPage.screenshot({ path: path.join(outDir, 'desktop-fold.png'), fullPage: false });
  console.log('desktop-fold done');
  await dCtx.close();

  // Mobile
  const mCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    ignoreHTTPSErrors: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  });
  const mPage = await mCtx.newPage();
  await mPage.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await mPage.waitForTimeout(2000);
  await mPage.screenshot({ path: path.join(outDir, 'mobile.png'), fullPage: true });
  console.log('mobile done');
  await mCtx.close();

  await browser.close();
})().catch(e => { console.error(e.message); process.exit(1); });
