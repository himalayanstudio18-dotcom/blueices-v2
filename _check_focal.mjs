import puppeteer from 'puppeteer';
const OUT = 'C:\\Users\\gigastar\\AppData\\Local\\Temp\\claude\\E--other-project-home-stay-website\\b59e60ce-86ce-4c06-97fd-8fac0f043841\\scratchpad\\shots';

const pages = [
  { path: '/stays', selector: '.stays-hero', name: 'stays' },
  { path: '/experiences', selector: '.experiences-hero', name: 'experiences' },
  { path: '/story', selector: '.story-hero', name: 'story' },
  { path: '/contact', selector: '.contact-hero', name: 'contact' },
];

const widths = [390, 767, 768, 1024];

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'], protocolTimeout: 60000 });
try {
  const page = await browser.newPage();
  for (const w of widths) {
    await page.setViewport({ width: w, height: 1000, deviceScaleFactor: 1 });
    for (const p of pages) {
      await page.goto(`http://localhost:3000${p.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.evaluate(() => new Promise((r) => setTimeout(r, 700)));
      const el = await page.$(p.selector);
      if (!el) { console.log('MISSING', p.name, w); continue; }
      await el.screenshot({ path: `${OUT}\\focal-${p.name}-${w}.png` });
      console.log('saved', p.name, w);
    }
  }
} finally {
  await browser.close();
}
