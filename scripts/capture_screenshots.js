import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHROME_PATH = '/home/sandy/.cache/puppeteer/chrome/linux_arm-152.0.7977.42/chrome-linux64/chrome';
const SCREENSHOT_DIR = path.resolve(__dirname, '../assets/screenshots');
const WEB_URL = 'http://a6a6cb58e256448a5af8d87b9fa1519b-1501577180.us-east-1.elb.amazonaws.com';
const GRAFANA_URL = 'http://localhost:3001';
const GRAFANA_USER = 'admin';
const GRAFANA_PASS = '3CvTuFF6hUbzurf8izNddx2mKVvnLBfZYIYI5eNT';

async function main() {
  console.log('🚀 Launching headless browser to capture production screenshots...');
  
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();

  // -------------------------------------------------------------
  // 1. Capture Webpage Full and Sections
  // -------------------------------------------------------------
  console.log(`📸 Navigating to Webpage: ${WEB_URL}`);
  await page.goto(WEB_URL, { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('#playground', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot 1: Webpage Full / Hero
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '01-webpage-hero.png'),
    clip: { x: 0, y: 0, width: 1920, height: 1080 }
  });
  console.log('✅ Saved 01-webpage-hero.png');

  // Trigger an inference on the live webpage to show the result card
  console.log('⚡ Triggering live inference in UI...');
  const presetBtn = await page.$('button:has-text("Civil & Friendly"), button:has-text("Friendly Message")');
  if (presetBtn) {
    await presetBtn.click();
    await new Promise(r => setTimeout(r, 3000));
  }

  // Screenshot 2: Inference Playground with Result
  const playgroundElem = await page.$('#playground');
  if (playgroundElem) {
    await playgroundElem.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-webpage-inference.png')
    });
    console.log('✅ Saved 02-webpage-inference.png');
  }

  // Screenshot 3: Dissertation Section & Benchmark Matrix
  const researchElem = await page.$('#research');
  if (researchElem) {
    await researchElem.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-webpage-dissertation.png')
    });
    console.log('✅ Saved 03-webpage-dissertation.png');
  }

  // Screenshot 4: 6-Layer Architecture Visualizer
  const archElem = await page.$('#architecture');
  if (archElem) {
    await archElem.screenshot({
      path: path.join(SCREENSHOT_DIR, '04-webpage-architecture.png')
    });
    console.log('✅ Saved 04-webpage-architecture.png');
  }

  // -------------------------------------------------------------
  // 2. Capture Grafana Dashboard
  // -------------------------------------------------------------
  console.log(`📸 Navigating to Grafana: ${GRAFANA_URL}/login`);
  await page.goto(`${GRAFANA_URL}/login`, { waitUntil: 'networkidle0', timeout: 20000 });

  // Fill in login credentials
  await page.type('input[name="user"]', GRAFANA_USER);
  await page.type('input[name="password"]', GRAFANA_PASS);
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 20000 });

  console.log('📊 Opening Hate Speech Classifier Dashboard...');
  await page.goto(`${GRAFANA_URL}/d/hate-speech-backend?from=now-30m&to=now&refresh=5s&kiosk=tv`, { 
    waitUntil: 'networkidle0', 
    timeout: 30000 
  });
  await new Promise(r => setTimeout(r, 4000));

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, '05-grafana-dashboard.png'),
    fullPage: false
  });
  console.log('✅ Saved 05-grafana-dashboard.png');

  await browser.close();
  console.log('🎉 All high-resolution screenshots captured successfully!');
}

main().catch(err => {
  console.error('❌ Error capturing screenshots:', err);
  process.exit(1);
});
