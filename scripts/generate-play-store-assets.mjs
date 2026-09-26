import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('docs/play-store-assets');
fs.mkdirSync(OUT_DIR, { recursive: true });

function getImageBase64(relPath) {
  const fullPath = path.resolve(relPath);
  if (fs.existsSync(fullPath)) {
    const ext = path.extname(fullPath).slice(1);
    const data = fs.readFileSync(fullPath).toString('base64');
    return `data:image/${ext === 'svg' ? 'svg+xml' : ext};base64,${data}`;
  }
  return '';
}

const logoImg = getImageBase64('public/logo.png');
const heroImg = getImageBase64('public/onboarding/hero.jpg');
const bioImg = getImageBase64('public/onboarding/bio.jpg');
const interestsImg = getImageBase64('public/onboarding/interests.jpg');
const locationImg = getImageBase64('public/onboarding/location.jpg');
const adventureImg = getImageBase64('public/onboarding/quiz-adventurous.jpg');

const CSS_COMMON = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}
body {
  width: 1080px;
  height: 2400px;
  background: radial-gradient(circle at 50% 12%, #14221b 0%, #090e0b 45%, #040605 100%);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Outfit", "Inter", "Segoe UI", Roboto, sans-serif;
  color: #FFFFFF;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.ambient-glow {
  position: absolute;
  top: 8%;
  left: 50%;
  transform: translateX(-50%);
  width: 900px;
  height: 600px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(245, 158, 11, 0.08) 55%, transparent 75%);
  filter: blur(90px);
  pointer-events: none;
  z-index: 1;
}
.marketing-header {
  position: relative;
  z-index: 10;
  width: 980px;
  text-align: center;
  margin-top: 110px;
  margin-bottom: 50px;
}
.marketing-tag {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border-radius: 9999px;
  background: rgba(16, 185, 129, 0.16);
  border: 1.5px solid rgba(16, 185, 129, 0.45);
  color: #34d399;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 22px;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
}
.marketing-title {
  font-size: 68px;
  font-weight: 800;
  line-height: 1.14;
  letter-spacing: -1.5px;
  color: #FFFFFF;
  margin-bottom: 16px;
}
.marketing-title span {
  background: linear-gradient(135deg, #10b981 0%, #34d399 45%, #fbbf24 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.marketing-subtitle {
  font-size: 28px;
  font-weight: 400;
  line-height: 1.45;
  color: #94a3b8;
  max-width: 880px;
  margin: 0 auto;
}
.phone-mockup {
  position: relative;
  z-index: 10;
  width: 880px;
  height: 1720px;
  background: #0B0614;
  border-radius: 54px 54px 0 0;
  border: 12px solid #1f2923;
  border-bottom: none;
  box-shadow: 0 -20px 80px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 100px rgba(16, 185, 129, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 24px;
}
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 10px;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  opacity: 0.9;
}
.notch {
  width: 140px;
  height: 26px;
  background: #000000;
  border-radius: 20px;
}
`;

// SCREEN 1: EXPLORE & MEET PEOPLE FOR TRIPS
const SCREEN_1_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${CSS_COMMON}
.trip-card {
  background: linear-gradient(180deg, rgba(30, 41, 35, 0.75) 0%, rgba(15, 23, 19, 0.9) 100%);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5);
}
.trip-img {
  width: 100%;
  height: 260px;
  object-fit: cover;
  position: relative;
}
.trip-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(16, 185, 129, 0.4);
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  color: #34d399;
  display: flex;
  align-items: center;
  gap: 6px;
}
.trip-details {
  padding: 20px 22px;
}
.pill-row {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  overflow-x: hidden;
}
.pill {
  padding: 10px 20px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}
.pill.active {
  background: #10b981;
  color: #000000;
  font-weight: 700;
}
</style>
</head>
<body>
  <div class="ambient-glow"></div>
  <div class="marketing-header">
    <div class="marketing-tag">✈️ Real Travel Companions</div>
    <h1 class="marketing-title">Meet New People for <span>Any Trip</span></h1>
    <p class="marketing-subtitle">Road trips, weekend escapes, beach villas, cafe crawls & mountain treks with verified travelers.</p>
  </div>

  <div class="phone-mockup">
    <div class="status-bar">
      <span>9:41</span>
      <div class="notch"></div>
      <span>5G 100%</span>
    </div>

    <!-- In-App Header -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin: 18px 0;">
      <div>
        <h2 style="font-size:26px; font-weight:800; color:#fff;">Explore Trips</h2>
        <p style="font-size:14px; color:#10b981; font-weight:600;">Find travel partners near you</p>
      </div>
      <div style="background:rgba(16,185,129,0.15); border:1px solid #10b981; color:#34d399; font-weight:700; font-size:14px; padding:8px 18px; border-radius:999px; display:flex; align-items:center; gap:6px;">
        + Host Trip
      </div>
    </div>

    <!-- Category Pills -->
    <div class="pill-row">
      <div class="pill active">🏔️ All Getaways</div>
      <div class="pill">🏖️ Goa Beach</div>
      <div class="pill">🌲 Manali Trek</div>
      <div class="pill">☕ Cafe Crawl</div>
    </div>

    <!-- Trip Card 1 -->
    <div class="trip-card">
      <div style="position:relative;">
        <img src="${adventureImg}" class="trip-img" />
        <div class="trip-badge">⚡ Manali • 4 Spots Left</div>
      </div>
      <div class="trip-details">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
          <h3 style="font-size:22px; font-weight:700; color:#fff;">Old Manali Cafe & Snow Trek</h3>
          <span style="font-size:15px; color:#34d399; font-weight:700; background:rgba(16,185,129,0.12); padding:4px 10px; border-radius:8px;">Oct 12-16</span>
        </div>
        <p style="font-size:14px; color:#94a3b8; margin-bottom:14px;">Weekend cabin stay, local cafe hopping, bonfire music, and hiking to Jogini falls!</p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:10px;">
            <img src="${bioImg}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; border:2px solid #10b981;" />
            <div>
              <div style="font-size:14px; font-weight:700; color:#fff;">Hosted by Sarah • <span style="color:#10b981;">✓ Verified</span></div>
              <div style="font-size:12px; color:#64748b;">Adventure & Culture Vibe</div>
            </div>
          </div>
          <button style="background:#10b981; border:none; color:#000; font-weight:700; font-size:14px; padding:10px 20px; border-radius:14px;">Join Trip</button>
        </div>
      </div>
    </div>

    <!-- Trip Card 2 -->
    <div class="trip-card">
      <div style="position:relative;">
        <img src="${heroImg}" class="trip-img" />
        <div class="trip-badge">🌊 Goa • 2 Spots Left</div>
      </div>
      <div class="trip-details">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
          <h3 style="font-size:22px; font-weight:700; color:#fff;">South Goa Sunset Villa Escape</h3>
          <span style="font-size:15px; color:#34d399; font-weight:700; background:rgba(16,185,129,0.12); padding:4px 10px; border-radius:8px;">Nov 02-06</span>
        </div>
        <p style="font-size:14px; color:#94a3b8; margin-bottom:14px;">Beachside working, sundowner cocktails, and secret cove exploring.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// SCREEN 2: 100% VERIFIED DISCOVERY & PROFILES
const SCREEN_2_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${CSS_COMMON}
.profile-card {
  position: relative;
  width: 100%;
  height: 980px;
  border-radius: 36px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1);
}
.profile-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.95) 100%);
}
.profile-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30px;
}
.match-score {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 18px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.25);
  backdrop-filter: blur(12px);
  border: 1.5px solid #10b981;
  color: #34d399;
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 14px;
}
.chip {
  display: inline-block;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
  margin-right: 8px;
  margin-bottom: 8px;
}
.actions-row {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 30px;
}
.action-btn {
  width: 74px;
  height: 74px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border: none;
}
.btn-pass {
  background: rgba(239, 68, 68, 0.15);
  border: 2px solid rgba(239, 68, 68, 0.4);
  color: #ef4444;
}
.btn-like {
  background: #10b981;
  color: #000;
  box-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
}
</style>
</head>
<body>
  <div class="ambient-glow"></div>
  <div class="marketing-header">
    <div class="marketing-tag">✨ Verified Travelers</div>
    <h1 class="marketing-title">Connect With <span>Matching Vibes</span></h1>
    <p class="marketing-subtitle">Discover real people with shared travel styles, mutual bucket lists, and verified identities.</p>
  </div>

  <div class="phone-mockup">
    <div class="status-bar">
      <span>9:41</span>
      <div class="notch"></div>
      <span>5G 100%</span>
    </div>

    <div style="margin-top:20px;">
      <div class="profile-card">
        <img src="${bioImg}" class="profile-bg" />
        <div class="profile-gradient"></div>
        <div class="profile-info">
          <div class="match-score">🔥 96% Vibe Match • Road Trips & Treks</div>
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
            <h2 style="font-size:32px; font-weight:800; color:#fff;">Kavya Sharma, 25</h2>
            <span style="background:#10b981; color:#000; font-size:12px; font-weight:800; padding:3px 8px; border-radius:6px;">✓ VERIFIED</span>
          </div>
          <p style="font-size:15px; color:#cbd5e1; margin-bottom:16px;">"Architect & amateur photographer. Planning a Spiti road trip next month — looking for someone who loves spontaneous stops and starry skies!"</p>
          <div>
            <span class="chip">🏔️ Mountain Treks</span>
            <span class="chip">📷 Photography</span>
            <span class="chip">☕ Cozy Cafes</span>
            <span class="chip">🚗 Roadtrips</span>
          </div>
        </div>
      </div>

      <div class="actions-row">
        <button class="action-btn btn-pass">✕</button>
        <button class="action-btn btn-like">✈️</button>
      </div>
    </div>
  </div>
</body>
</html>
`;

// SCREEN 3: REALTIME CHAT & TRIP COORDINATION
const SCREEN_3_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${CSS_COMMON}
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 10px;
}
.chat-bubble {
  max-width: 80%;
  padding: 16px 20px;
  border-radius: 22px;
  font-size: 16px;
  line-height: 1.45;
  margin-bottom: 16px;
}
.bubble-them {
  align-self: flex-start;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
  border-bottom-left-radius: 6px;
}
.bubble-me {
  align-self: flex-end;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #000000;
  font-weight: 500;
  border-bottom-right-radius: 6px;
}
.trip-summary-box {
  background: rgba(16, 185, 129, 0.12);
  border: 1.5px solid rgba(16, 185, 129, 0.35);
  border-radius: 22px;
  padding: 16px 20px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>
</head>
<body>
  <div class="ambient-glow"></div>
  <div class="marketing-header">
    <div class="marketing-tag">💬 Effortless Coordination</div>
    <h1 class="marketing-title">Chat & Plan <span>Together</span></h1>
    <p class="marketing-subtitle">Break the ice with mutual interests, coordinate itineraries, and share travel ideas before heading out.</p>
  </div>

  <div class="phone-mockup">
    <div class="status-bar">
      <span>9:41</span>
      <div class="notch"></div>
      <span>5G 100%</span>
    </div>

    <!-- Chat Header -->
    <div style="display:flex; align-items:center; gap:14px; padding:16px 0; border-bottom:1px solid rgba(255,255,255,0.08); margin-bottom:20px;">
      <img src="${bioImg}" style="width:48px; height:48px; border-radius:50%; object-fit:cover; border:2px solid #10b981;" />
      <div>
        <h3 style="font-size:18px; font-weight:700; color:#fff;">Kavya Sharma <span style="color:#10b981; font-size:14px;">✓</span></h3>
        <p style="font-size:13px; color:#34d399;">Active • Spiti Roadtrip Planning</p>
      </div>
    </div>

    <!-- Pinned Trip Box -->
    <div class="trip-summary-box">
      <img src="${adventureImg}" style="width:60px; height:60px; border-radius:14px; object-fit:cover;" />
      <div>
        <div style="font-size:16px; font-weight:700; color:#fff;">Spiti Valley 7-Day Expedition</div>
        <div style="font-size:13px; color:#34d399;">Confirmed for Oct 12 • 4 Travelers</div>
      </div>
    </div>

    <!-- Messages -->
    <div class="chat-container">
      <div class="chat-bubble bubble-them">
        Hey! Saw you're heading to Spiti too! Have you booked the homestay in Kaza yet? 🏔️
      </div>
      <div class="chat-bubble bubble-me">
        Hey Kavya! Yes, booked a traditional mud house with direct views of the monastery! Room for one more if you want in.
      </div>
      <div class="chat-bubble bubble-them">
        That sounds magical! Count me in. I'm bringing my DSLR for the Milky Way night shots ✨
      </div>
      <div class="chat-bubble bubble-me">
        Awesome! Let's meet at the Manali cafe basecamp on Thursday! 🚗☕
      </div>
    </div>
  </div>
</body>
</html>
`;

// SCREEN 4: HOST TRIPS & GETAWAYS
const SCREEN_4_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${CSS_COMMON}
.modal-box {
  background: linear-gradient(180deg, #18241d 0%, #0c1410 100%);
  border: 1.5px solid rgba(16, 185, 129, 0.35);
  border-radius: 32px;
  padding: 30px 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
  margin-top: 20px;
}
.input-label {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #34d399;
  margin-bottom: 8px;
}
.mock-input {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 16px;
  font-size: 16px;
  color: #FFFFFF;
  margin-bottom: 20px;
}
</style>
</head>
<body>
  <div class="ambient-glow"></div>
  <div class="marketing-header">
    <div class="marketing-tag">🏕️ Group & Solo Journeys</div>
    <h1 class="marketing-title">Host Your Own <span>Epic Getaway</span></h1>
    <p class="marketing-subtitle">Create a trip in seconds, set group size & preferences, review join requests, and travel safe.</p>
  </div>

  <div class="phone-mockup">
    <div class="status-bar">
      <span>9:41</span>
      <div class="notch"></div>
      <span>5G 100%</span>
    </div>

    <div class="modal-box">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2 style="font-size:24px; font-weight:800; color:#fff;">Create New Trip</h2>
        <span style="font-size:14px; color:#94a3b8;">Step 1 of 2</span>
      </div>

      <div class="input-label">Destination</div>
      <div class="mock-input">📍 Gokarna & Murudeshwar Coastal Trek</div>

      <div class="input-label">Trip Dates</div>
      <div class="mock-input">📅 Nov 15 - Nov 18, 2026</div>

      <div class="input-label">Travel Vibe</div>
      <div style="display:flex; gap:10px; margin-bottom:20px;">
        <span style="background:#10b981; color:#000; font-weight:700; padding:10px 16px; border-radius:12px; font-size:14px;">🏖️ Beach & Sunset</span>
        <span style="background:rgba(255,255,255,0.08); color:#cbd5e1; font-weight:600; padding:10px 16px; border-radius:12px; font-size:14px;">🏕️ Camping</span>
      </div>

      <div class="input-label">Trip Description</div>
      <div class="mock-input" style="height:100px;">Beach hopping from Om Beach to Half Moon, cliff sunset dining, and overnight camp under stars!</div>

      <button style="width:100%; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#000; font-weight:800; font-size:17px; padding:18px; border-radius:18px; border:none; box-shadow:0 8px 30px rgba(16,185,129,0.4);">Publish Trip & Invite Travelers 🚀</button>
    </div>
  </div>
</body>
</html>
`;

// SCREEN 5: SAFETY, PRIVACY & VERIFIED BADGES
const SCREEN_5_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${CSS_COMMON}
.trust-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
}
.trust-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 24px 18px;
  text-align: center;
}
.trust-icon {
  font-size: 36px;
  margin-bottom: 12px;
}
.trust-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 6px;
}
.trust-desc {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.4;
}
</style>
</head>
<body>
  <div class="ambient-glow"></div>
  <div class="marketing-header">
    <div class="marketing-tag">🛡️ Safety & Trust First</div>
    <h1 class="marketing-title">100% Real, <span>Verified Travel</span></h1>
    <p class="marketing-subtitle">Zero fake profiles. Built-in selfie verification, strict community guidelines, and instant blocking.</p>
  </div>

  <div class="phone-mockup">
    <div class="status-bar">
      <span>9:41</span>
      <div class="notch"></div>
      <span>5G 100%</span>
    </div>

    <div style="text-align:center; padding: 40px 20px 20px;">
      <div style="width:100px; height:100px; border-radius:50%; background:rgba(16,185,129,0.15); border:3px solid #10b981; display:flex; align-items:center; justify-content:center; font-size:48px; margin: 0 auto 20px; box-shadow:0 0 50px rgba(16,185,129,0.4);">
        🛡️
      </div>
      <h2 style="font-size:28px; font-weight:800; color:#fff;">GreenFlag Safe Community</h2>
      <p style="font-size:15px; color:#94a3b8; margin-top:8px;">Your safety is our top priority on every single journey.</p>
    </div>

    <div class="trust-grid">
      <div class="trust-card">
        <div class="trust-icon">📸</div>
        <div class="trust-title">Photo Verified</div>
        <div class="trust-desc">Every profile is identity-verified before joining trips.</div>
      </div>
      <div class="trust-card">
        <div class="trust-icon">🔒</div>
        <div class="trust-title">Privacy Guard</div>
        <div class="trust-desc">Screenshot protection and secure private chats.</div>
      </div>
      <div class="trust-card">
        <div class="trust-icon">🚫</div>
        <div class="trust-title">Zero Tolerances</div>
        <div class="trust-desc">Instant 1-tap reporting and 24/7 moderation.</div>
      </div>
      <div class="trust-card">
        <div class="trust-icon">⭐</div>
        <div class="trust-title">Vetted Hosts</div>
        <div class="trust-desc">Community reviews and verified host ratings.</div>
      </div>
    </div>
  </div>
</body>
</html>
`;

// FEATURE GRAPHIC (1024 x 500)
const FEATURE_GRAPHIC_HTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  width: 1024px;
  height: 500px;
  background: radial-gradient(circle at 70% 30%, #15271e 0%, #080e0b 50%, #030504 100%);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Outfit", "Inter", sans-serif;
  color: #FFFFFF;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 70px;
  position: relative;
}
.feature-glow {
  position: absolute;
  top: 50%;
  left: 20%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 350px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(245, 158, 11, 0.1) 60%, transparent 80%);
  filter: blur(80px);
}
.left-content {
  position: relative;
  z-index: 10;
  max-width: 540px;
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.18);
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
.right-visual {
  position: relative;
  z-index: 10;
  display: flex;
  gap: 16px;
  transform: rotate(4deg);
}
.card-mini {
  width: 170px;
  height: 260px;
  border-radius: 20px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 16px 40px rgba(0,0,0,0.8);
  position: relative;
}
.card-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
</head>
<body>
  <div class="feature-glow"></div>
  <div class="left-content">
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
      <img src="${logoImg}" style="width:44px; height:44px; border-radius:12px;" />
      <span style="font-size:22px; font-weight:800; letter-spacing:0.5px; color:#fff;">GreenFlag</span>
    </div>
    <div class="tag">✈️ Travel Companions</div>
    <h1 class="title">Meet New People for <span>Real Trips</span></h1>
    <p class="sub">Road trips, weekend escapes, beach retreats, cafe crawls & mountain treks with verified companions.</p>
  </div>

  <div class="right-visual">
    <div class="card-mini" style="transform: translateY(-20px);">
      <img src="${adventureImg}" />
    </div>
    <div class="card-mini" style="transform: translateY(20px);">
      <img src="${bioImg}" />
    </div>
  </div>
</body>
</html>
`;

async function main() {
  console.log('🚀 Generating Google Play Store Screenshots & Feature Graphic with Chrome...');
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
  });

  // 1. Generate 5 Phone Screenshots (1080 x 2400)
  const phoneContext = await browser.newContext({
    viewport: { width: 1080, height: 2400 },
    deviceScaleFactor: 1,
  });

  const screens = [
    { name: '01_hero_trips.png', html: SCREEN_1_HTML },
    { name: '02_verified_travelers.png', html: SCREEN_2_HTML },
    { name: '03_trip_chat.png', html: SCREEN_3_HTML },
    { name: '04_host_trips.png', html: SCREEN_4_HTML },
    { name: '05_trust_safety.png', html: SCREEN_5_HTML },
  ];

  for (const item of screens) {
    const page = await phoneContext.newPage();
    await page.setContent(item.html, { waitUntil: 'load' });
    await page.waitForTimeout(400);
    const dest = path.join(OUT_DIR, item.name);
    await page.screenshot({ path: dest, type: 'png' });
    console.log(`  ✅ Generated: ${dest}`);
    await page.close();
  }

  // 2. Generate Feature Graphic (1024 x 500)
  const featureContext = await browser.newContext({
    viewport: { width: 1024, height: 500 },
    deviceScaleFactor: 1,
  });
  const featurePage = await featureContext.newPage();
  await featurePage.setContent(FEATURE_GRAPHIC_HTML, { waitUntil: 'load' });
  await featurePage.waitForTimeout(400);
  const featureDest = path.join(OUT_DIR, 'feature_graphic.png');
  await featurePage.screenshot({ path: featureDest, type: 'png' });
  console.log(`  ✅ Generated Feature Graphic: ${featureDest}`);
  await featurePage.close();

  await browser.close();
  console.log('\n🎉 ALL GOOGLE PLAY ASSETS GENERATED IN: docs/play-store-assets/');
}

main().catch(console.error);
