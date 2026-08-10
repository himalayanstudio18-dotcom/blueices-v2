/* Screenshot helper — CLAUDE.md references this file; it did not
   exist, so it is created here.

   Usage:
     node screenshot.mjs http://localhost:3000 [label] [width]

   Saves to ./temporary screenshots/screenshot-N[-label].png,
   auto-incrementing so nothing is ever overwritten. */

import puppeteer from 'puppeteer';
import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const url = process.argv[2] ?? 'http://localhost:3000';
const label = process.argv[3] ?? '';
const width = Number(process.argv[4] ?? 1600);

const OUT = join(process.cwd(), 'temporary screenshots');
await mkdir(OUT, { recursive: true });

// Find the next free index
const existing = await readdir(OUT).catch(() => []);
const used = existing
  .map((f) => /^screenshot-(\d+)/.exec(f))
  .filter(Boolean)
  .map((m) => Number(m[1]));
const next = (used.length ? Math.max(...used) : 0) + 1;

const name = `screenshot-${next}${label ? `-${label}` : ''}.png`;
const path = join(OUT, name);

/* NOTE: do NOT add --disable-gpu here. It silently breaks
   backdrop-filter compositing and opacity entrance animations in
   headless, so glass panels and fading-in elements photograph as
   completely absent — a false negative that reads as a CSS bug. */
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  protocolTimeout: 120000,
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 });
  /* domcontentloaded, not networkidle0 — the hero runs infinite
     CSS animations and Google Fonts keeps connections warm, so
     the network never fully idles. */
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Scroll the full page so lazy-loaded images request and decode
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 220));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });

  // Wait for images to finish decoding. Hidden images (display:none,
  // e.g. the desktop-only duplicate gallery track on mobile widths)
  // never complete and img.decode() hangs forever on them, so they're
  // skipped; every image gets a timeout race as a second safety net.
  await page.evaluate(async () => {
    const withTimeout = (p, ms) =>
      Promise.race([p, new Promise((r) => setTimeout(r, ms))]);
    await Promise.all(
      Array.from(document.images)
        .filter((img) => img.offsetParent !== null)
        .map((img) =>
          img.complete ? Promise.resolve() : withTimeout(img.decode().catch(() => {}), 4000)
        )
    );
  });

  await page.evaluate(() => new Promise((r) => setTimeout(r, 900)));

  await page.screenshot({ path, fullPage: true });
  console.log(`saved: temporary screenshots/${name}  (${width}px)`);
} finally {
  await browser.close();
}
