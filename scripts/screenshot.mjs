// Chụp screenshot để so sánh với design gốc (docs/design/anh1.png, anh2.png).
// Dùng: node scripts/screenshot.mjs [baseUrl]   (mặc định http://localhost:5173)
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const base = process.argv[2] || 'http://localhost:5173';
const out = 'docs/screenshots';
mkdirSync(out, { recursive: true });

const viewports = {
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  small: { width: 320, height: 640, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  design: { width: 905, height: 749, deviceScaleFactor: 2 }, // khung của anh1.png / anh2.png (desktop)
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
};

const browser = await chromium.launch({ channel: 'chrome' });
for (const [name, vp] of Object.entries(viewports)) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, ...vp });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error(`[${name}] pageerror:`, e.message));

  // Màn hình mở thiệp
  await page.goto(`${base}/?to=Gia%20%C4%91%C3%ACnh%20Anh%20M%E1%BA%A1nh`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/cover-${name}.png` });

  // Trang nội dung: cuộn hết để kích hoạt animation
  await page.click('#open-btn');
  await page.waitForTimeout(1200);
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += vp.height / 2) {
    await page.evaluate((yy) => scrollTo(0, yy), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/content-${name}.png`, fullPage: true });

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(`${name}: height=${h}px, horizontal overflow=${overflow}px`);
  await ctx.close();
}
await browser.close();
