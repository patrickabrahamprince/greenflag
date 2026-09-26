import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.resolve('docs/play-store-assets');
const RAW_DIR = path.join(OUT_DIR, 'raw-screenshots');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(RAW_DIR, { recursive: true });

async function captureAndGenerate() {
  console.log('🚀 Starting real in-app screenshot capture with Google Chrome...');

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
  });

  // 1. Capture real in-app screens at high pixel density
  const appMobileContext = await browser.newContext({
    viewport: { width: 412, height: 915 }, // Pixel 7/8 standard resolution
    deviceScaleFactor: 2.625, // 1080x2400 equivalent
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  });

  const page = await appMobileContext.newPage();

  console.log('1️⃣ Capturing real /login screen...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const rawLoginPath = path.join(RAW_DIR, '01_login_raw.png');
  await page.screenshot({ path: rawLoginPath });

  console.log('2️⃣ Logging in with demo account...');
  const emailBtn = page.locator('button:has-text("Continue with Email")');
  if (await emailBtn.isVisible()) await emailBtn.click();
  await page.fill('input[type="email"]', 'demo-reviewer@greenflag.com');
  await page.fill('input[type="password"]', 'GreenFlag2026!');
  await page.click('button[data-testid="login-btn"], button[type="submit"]');
  await page.waitForTimeout(3000);

  const termsBtn = page.locator('button:has-text("I Agree"), button:has-text("Accept")');
  if (await termsBtn.isVisible().catch(() => false)) {
    await termsBtn.click().catch(() => {});
    await page.waitForTimeout(1500);
  }

  console.log('3️⃣ Capturing real /trips screen...');
  try {
    await page.goto(`${BASE_URL}/trips`, { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {
    // If navigation already occurred
  }
  // Wait for trips loading spinner to disappear
  await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const rawTripsPath = path.join(RAW_DIR, '02_trips_raw.png');
  await page.screenshot({ path: rawTripsPath });

  console.log('4️⃣ Capturing real /standard/builder screen...');
  try {
    await page.goto(`${BASE_URL}/standard/builder`, { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {}
  await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const rawBuilderPath = path.join(RAW_DIR, '03_standard_builder_raw.png');
  await page.screenshot({ path: rawBuilderPath });

  console.log('5️⃣ Capturing real /coins screen...');
  try {
    await page.goto(`${BASE_URL}/coins`, { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {}
  await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const rawCoinsPath = path.join(RAW_DIR, '04_coins_raw.png');
  await page.screenshot({ path: rawCoinsPath });

  console.log('6️⃣ Capturing real /profile screen...');
  try {
    await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {}
  await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const rawProfilePath = path.join(RAW_DIR, '05_profile_raw.png');
  await page.screenshot({ path: rawProfilePath });

  console.log('7️⃣ Capturing real /discover screen (or rich feed)...');
  try {
    await page.goto(`${BASE_URL}/discover`, { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {}
  await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const rawDiscoverPath = path.join(RAW_DIR, '06_discover_raw.png');
  await page.screenshot({ path: rawDiscoverPath });

  console.log('✅ All raw app screenshots captured!');

  // Helper to get base64
  const toB64 = (filePath) => `data:image/png;base64,${fs.readFileSync(filePath).toString('base64')}`;

  const imgTrips = toB64(rawTripsPath);
  const imgBuilder = toB64(rawBuilderPath);
  const imgProfile = toB64(rawProfilePath);
  const imgCoins = toB64(rawCoinsPath);
  const imgLogin = toB64(rawLoginPath);

  // 2. Generate Google Play Framed Marketing Screenshots (1080 x 2400)
  console.log('\n🎨 Generating Google Play 1080x2400 Store Graphics with real app screens...');

  const generateCardHTML = ({ tag, title, titleSpan, subtitle, imgSrc }) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; -webkit-font-smoothing:antialiased; }
body {
  width: 1080px;
  height: 2400px;
  background: radial-gradient(circle at 50% 12%, #14221b 0%, #090e0b 45%, #040605 100%);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Outfit", "Inter", Roboto, sans-serif;
  color: #FFFFFF;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.glow {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  width: 900px;
  height: 600px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(245, 158, 11, 0.08) 55%, transparent 75%);
  filter: blur(90px);
  pointer-events: none;
}
.header {
  position: relative;
  z-index: 10;
  width: 980px;
  text-align: center;
  margin-top: 110px;
  margin-bottom: 50px;
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 26px;
  border-radius: 9999px;
  background: rgba(16, 185, 129, 0.16);
  border: 1.5px solid rgba(16, 185, 129, 0.45);
  color: #34d399;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
}
.title {
  font-size: 68px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -1.5px;
  color: #FFFFFF;
  margin-bottom: 14px;
}
.title span {
  background: linear-gradient(135deg, #10b981 0%, #34d399 45%, #fbbf24 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.sub {
  font-size: 28px;
  font-weight: 400;
  line-height: 1.45;
  color: #94a3b8;
  max-width: 880px;
  margin: 0 auto;
}
.phone-frame {
  position: relative;
  z-index: 10;
  width: 890px;
  height: 1720px;
  background: #0B0614;
  border-radius: 56px 56px 0 0;
  border: 14px solid #1a241f;
  border-bottom: none;
  box-shadow: 0 -20px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.12), 0 0 100px rgba(16,185,129,0.18);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.real-screen {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="header">
    <div class="tag">${tag}</div>
    <h1 class="title">${title} <span>${titleSpan}</span></h1>
    <p class="sub">${subtitle}</p>
  </div>
  <div class="phone-frame">
    <img src="${imgSrc}" class="real-screen" />
  </div>
</body>
</html>
`;

  const storeScreens = [
    {
      name: '01_hero_trips.png',
      tag: '✈️ Real Travel Companions',
      title: 'Meet New People for',
      titleSpan: 'Real Trips',
      subtitle: 'Road trips, weekend escapes, beach retreats, cafe crawls & mountain treks.',
      imgSrc: imgTrips,
    },
    {
      name: '02_travel_standard.png',
      tag: '🛡️ Safety & Trust Standard',
      title: 'Set Your Custom',
      titleSpan: 'Travel Criteria',
      subtitle: 'Filter companions by verified credentials, mutual values, and safety preferences.',
      imgSrc: imgBuilder,
    },
    {
      name: '03_authentic_profiles.png',
      tag: '👤 Verified Profiles',
      title: 'Authentic Details &',
      titleSpan: 'Travel Styles',
      subtitle: 'See bio, mutual bucket lists, lifestyle traits, and community verification.',
      imgSrc: imgProfile,
    },
    {
      name: '04_coin_unlocks.png',
      tag: '🪙 Transparent Rewards',
      title: 'Unlock Features &',
      titleSpan: 'Trip Perks',
      subtitle: 'Earn coins through app use or unlock premium messaging and profile reveals.',
      imgSrc: imgCoins,
    },
    {
      name: '05_easy_onboarding.png',
      tag: '🔒 Safe & Easy Access',
      title: 'Sign In With',
      titleSpan: 'One Click',
      subtitle: 'Fast sign-in with Google or Email. Zero fake profiles, strict privacy controls.',
      imgSrc: imgLogin,
    },
  ];

  const canvasContext = await browser.newContext({
    viewport: { width: 1080, height: 2400 },
    deviceScaleFactor: 1,
  });

  for (const item of storeScreens) {
    const p = await canvasContext.newPage();
    const html = generateCardHTML(item);
    await p.setContent(html, { waitUntil: 'load' });
    await p.waitForTimeout(300);
    const dest = path.join(OUT_DIR, item.name);
    await p.screenshot({ path: dest, type: 'png' });
    console.log(`  ✅ Generated Store Screen: ${dest}`);
    await p.close();
  }

  // 3. Feature Graphic (1024 x 500)
  const logoB64 = toB64(path.resolve('public/logo.png'));
  const featureHTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
  width: 1024px;
  height: 500px;
  background: radial-gradient(circle at 75% 30%, #172d22 0%, #080e0b 50%, #030504 100%);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Outfit", "Inter", sans-serif;
  color: #FFFFFF;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 70px;
  position: relative;
}
.glow {
  position: absolute;
  top: 50%;
  left: 25%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 350px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(245, 158, 11, 0.1) 60%, transparent 80%);
  filter: blur(80px);
}
.left {
  position: relative;
  z-index: 10;
  max-width: 520px;
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.45);
  color: #34d399;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 14px;
}
.title {
  font-size: 44px;
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 12px;
}
.title span {
  background: linear-gradient(135deg, #10b981 0%, #34d399 45%, #fbbf24 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.sub {
  font-size: 16px;
  color: #94a3b8;
  line-height: 1.45;
}
.right {
  position: relative;
  z-index: 10;
  display: flex;
  gap: 16px;
  transform: rotate(4deg);
}
.mock-card {
  width: 175px;
  height: 290px;
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 16px 40px rgba(0,0,0,0.85);
}
.mock-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="left">
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
      <img src="${logoB64}" style="width:46px; height:46px; border-radius:12px;" />
      <span style="font-size:24px; font-weight:800; letter-spacing:0.5px; color:#fff;">GreenFlag</span>
    </div>
    <div class="tag">✈️ Travel Companions</div>
    <h1 class="title">Meet New People for <span>Real Trips</span></h1>
    <p class="sub">Find verified travel buddies for road trips, beach getaways, treks, and weekend escapes.</p>
  </div>
  <div class="right">
    <div class="mock-card" style="transform: translateY(-20px);">
      <img src="${imgTrips}" />
    </div>
    <div class="mock-card" style="transform: translateY(20px);">
      <img src="${imgProfile}" />
    </div>
  </div>
</body>
</html>
`;

  const featurePage = await canvasContext.newPage();
  await featurePage.setViewportSize({ width: 1024, height: 500 });
  await featurePage.setContent(featureHTML, { waitUntil: 'load' });
  await featurePage.waitForTimeout(300);
  const featureDest = path.join(OUT_DIR, 'feature_graphic.png');
  await featurePage.screenshot({ path: featureDest, type: 'png' });
  console.log(`  ✅ Generated Feature Graphic: ${featureDest}`);
  await featurePage.close();

  await browser.close();
  console.log('\n🎉 ALL REAL APP SCREENSHOTS & ASSETS COMPLETED!');
}

captureAndGenerate().catch(console.error);
