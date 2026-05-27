#!/usr/bin/env node
// Usage: node screenshot.js [url] [outdir]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const url = process.argv[2] || 'http://localhost:8080';
const outDir = process.argv[3] || '/tmp/drct-screenshots';
fs.mkdirSync(outDir, { recursive: true });

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  // Desktop
  const desktopCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const desktopPage = await desktopCtx.newPage();
  await desktopPage.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
  await desktopPage.waitForTimeout(600);
  const desktopPath = path.join(outDir, 'desktop.png');
  await desktopPage.screenshot({ path: desktopPath, fullPage: true });
  console.log('desktop:', desktopPath);
  await desktopCtx.close();

  // Mobile (iPhone 13 equivalent)
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
  await mobilePage.waitForTimeout(600);
  const mobilePath = path.join(outDir, 'mobile.png');
  await mobilePage.screenshot({ path: mobilePath, fullPage: true });
  console.log('mobile:', mobilePath);
  await mobileCtx.close();

  await browser.close();
})();
