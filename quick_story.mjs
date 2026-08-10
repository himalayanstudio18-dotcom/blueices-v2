import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-dev-shm-usage'], protocolTimeout: 60000 });
const page = await browser.newPage();
await page.setViewport({ width: 800, height: 1200, deviceScaleFactor: 1 });
await page.goto('http://localhost:3000/story', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.evaluate(() => new Promise(r => setTimeout(r, 2000)));
await page.screenshot({ path: 'temporary screenshots/story-quick-tablet.png' });
await browser.close();
console.log('done');
