import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('docs/ios-store-assets');
fs.mkdirSync(OUT_DIR, { recursive: true });

function getImageBase64(relPath) {
  const fullPath = path.resolve(relPath);
  if (fs.existsSync(fullPath)) {
    const ext = path.extname(fullPath).slice(1);
    const data = fs.readFileSync(fullPath).toString('base64');
    return `data:image/${ext};base64,${data}`;
  }
  return '';
}

const heroPhoto = getImageBase64('public/onboarding/hero.jpg');
const bioPhoto = getImageBase64('public/onboarding/bio.jpg');
const interestsPhoto = getImageBase64('public/onboarding/interests.jpg');

const CSS_RESET = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}
body {
  width: 1284px;
  height: 2778px;
  background: radial-gradient(circle at 50% 10%, #171d1a 0%, #0a0e0c 50%, #050706 100%);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif;
  color: #FFFFFF;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

/* Ambient glow accents */
.ambient-glow {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  width: 1000px;
  height: 700px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(212, 175, 55, 0.08) 50%, transparent 80%);
  filter: blur(80px);
  pointer-events: none;
  z-index: 1;
}

/* Top Marketing Section */
.marketing-header {
  position: relative;
  z-index: 10;
  width: 1100px;
  text-align: center;
  margin-top: 130px;
  margin-bottom: 70px;
}
.marketing-tag {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 28px;
  border-radius: 9999px;
  background: rgba(16, 185, 129, 0.14);
  border: 1.5px solid rgba(16, 185, 129, 0.4);
  color: #34d399;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  margin-bottom: 28px;
}
.marketing-title {
  font-size: 78px;
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -1.5px;
  color: #FFFFFF;
  margin-bottom: 20px;
}
.marketing-title span {
  background: linear-gradient(135deg, #10b981 0%, #34d399 50%, #fbbf24 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.marketing-subtitle {
  font-size: 32px;
  font-weight: 400;
  line-height: 1.45;
  color: #94a3b8;
  max-width: 980px;
  margin: 0 auto;
}

/* Realistic iPhone Device Frame */
.device-wrapper {
  position: relative;
  z-index: 10;
  width: 980px;
  height: 2050px;
  background: #090d0b;
  border-radius: 110px;
  padding: 24px;
  box-shadow: 
    0 0 0 10px #222a25,
    0 0 0 14px #121815,
    0 40px 100px -20px rgba(0, 0, 0, 0.9),
    0 0 80px rgba(16, 185, 129, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Screen Area inside device */
.device-screen {
  width: 100%;
  height: 100%;
  background: #0a0a0a;
  border-radius: 90px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Status Bar & Dynamic Island */
.status-bar {
  width: 100%;
  height: 90px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 54px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 50;
  font-size: 26px;
  font-weight: 600;
  color: #FFFFFF;
}
.dynamic-island {
  position: absolute;
  top: 22px;
  left: 50%;
  transform: translateX(-50%);
  width: 250px;
  height: 58px;
  background: #000000;
  border-radius: 35px;
  z-index: 60;
}
.status-icons {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 22px;
}

/* App Bottom Navigation Bar */
.bottom-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 110px;
  background: rgba(10, 14, 12, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: 20px;
  z-index: 40;
}
.nav-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 18px;
  font-weight: 600;
}
.nav-tab.active {
  color: #34d399;
}
`;

// SCREENSHOT 1: TRIPS FEED
const SCREENSHOT_1_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    ${CSS_RESET}
    .trips-container {
      padding: 110px 36px 120px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      height: 100%;
      overflow: hidden;
      background: #000000;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .filter-scroll {
      display: flex;
      gap: 14px;
      overflow: hidden;
      padding-bottom: 4px;
    }
    .filter-chip {
      padding: 12px 26px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.08);
      font-size: 20px;
      font-weight: 600;
      color: #94a3b8;
      white-space: nowrap;
    }
    .filter-chip.active {
      background: #10b981;
      color: #000000;
      font-weight: 700;
    }
    .trip-card {
      background: #121216;
      border: 1.5px solid rgba(255, 255, 255, 0.1);
      border-radius: 36px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .trip-card-hero {
      position: relative;
      height: 270px;
      background-size: cover;
      background-position: center;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 24px;
    }
    .hero-badges {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .badge-vibe {
      padding: 8px 18px;
      border-radius: 9999px;
      background: #10b981;
      color: #000000;
      font-size: 18px;
      font-weight: 800;
    }
    .badge-safety {
      padding: 8px 18px;
      border-radius: 9999px;
      background: #9333ea;
      color: #FFFFFF;
      font-size: 18px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .trip-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .host-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .host-info {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .host-avatar {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background-size: cover;
      border: 2px solid #10b981;
    }
    .trip-desc {
      font-size: 21px;
      color: #cbd5e1;
      line-height: 1.45;
    }
    .trip-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .btn-join {
      padding: 14px 28px;
      border-radius: 20px;
      background: #10b981;
      color: #000000;
      font-size: 20px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  </style>
</head>
<body>
  <div class="ambient-glow"></div>
  
  <div class="marketing-header">
    <div class="marketing-tag">
      ✈️ Meet New People for Trips
    </div>
    <h1 class="marketing-title">Any Trip.<br/><span>Meet Your Crew.</span></h1>
    <p class="marketing-subtitle">Road trips, beach escapes, mountain treks, cafe crawls, or camping — never travel alone.</p>
  </div>

  <div class="device-wrapper">
    <div class="device-screen">
      <div class="status-bar">
        <span>9:41</span>
        <div class="status-icons">5G &nbsp; 100%</div>
      </div>
      <div class="dynamic-island"></div>

      <div class="trips-container">
        <div class="header-row">
          <div>
            <h1 style="font-size: 42px; font-weight: 900; color: #FFFFFF; display: flex; align-items: center; gap: 10px;">
              Trips <span style="width:12px;height:12px;border-radius:50%;background:#10b981;"></span>
            </h1>
            <p style="font-size: 20px; color: #94a3b8; margin-top: 4px;">Don't travel alone. Travel together.</p>
          </div>
          <div style="padding: 12px 24px; border-radius: 9999px; background: #10b981; color: #000000; font-size: 20px; font-weight: 800;">
            + New Trip
          </div>
        </div>

        <div class="filter-scroll">
          <div class="filter-chip active">All Destinations</div>
          <div class="filter-chip">Goa</div>
          <div class="filter-chip">Coorg</div>
          <div class="filter-chip">Gokarna</div>
          <div class="filter-chip">Rishikesh</div>
          <div class="filter-chip">Hampi</div>
        </div>

        <!-- Trip Card 1 -->
        <div class="trip-card">
          <div class="trip-card-hero" style="background-image: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(18,18,22,0.95) 100%), url('https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80');">
            <div class="hero-badges">
              <span class="badge-vibe">🏖️ BEACH</span>
              <span class="badge-safety">🛡️ Female-Only</span>
            </div>
            <div>
              <h2 style="font-size: 38px; font-weight: 900; color: #FFFFFF;">Goa Weekend Getaway</h2>
              <p style="font-size: 20px; color: #34d399; font-weight: 600;">Oct 2 &ndash; Oct 6 &middot; Self-Drive Thar Split</p>
            </div>
          </div>
          <div class="trip-body">
            <div class="host-row">
              <div class="host-info">
                <div class="host-avatar" style="background-image: url('${heroPhoto}');"></div>
                <div>
                  <h3 style="font-size: 22px; font-weight: 700; color: #FFFFFF;">Tanya Sen &nbsp;<span style="color:#34d399;">✓</span></h3>
                  <p style="font-size: 17px; color: #94a3b8;">Bangalore &middot; 26 yrs</p>
                </div>
              </div>
              <div style="font-size: 19px; color: #fbbf24; font-weight: 700;">
                2 spots open
              </div>
            </div>
            <p class="trip-desc">
              Pool villa in Vagator! Sunset shack dinners, live music sessions, cafe hopping, and beach lounging. Splitting villa stay and car.
            </p>
            <div class="trip-footer">
              <div style="font-size: 20px; font-weight: 700; color: #FFFFFF;">
                ₹2,200 <span style="font-size:16px;color:#94a3b8;font-weight:400;">/ day est.</span>
              </div>
              <div class="btn-join">
                Request to Join →
              </div>
            </div>
          </div>
        </div>

        <!-- Trip Card 2 (Partial peek) -->
        <div class="trip-card">
          <div class="trip-card-hero" style="height: 180px; background-image: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(18,18,22,0.95) 100%), url('https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80');">
            <div class="hero-badges">
              <span class="badge-vibe">🥾 TREK</span>
            </div>
            <div>
              <h2 style="font-size: 32px; font-weight: 900; color: #FFFFFF;">Coorg Sunrise Hike</h2>
              <p style="font-size: 18px; color: #34d399; font-weight: 600;">Sep 28 &ndash; Sep 29 &middot; Royal Enfield Split</p>
            </div>
          </div>
        </div>

        <div class="bottom-nav">
          <div class="nav-tab active">
            <svg style="width:26px;height:26px;" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
            Trips
          </div>
          <div class="nav-tab">
            <svg style="width:26px;height:26px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m16 8-8 8"/></svg>
            Meet People
          </div>
          <div class="nav-tab">
            <svg style="width:26px;height:26px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>
            My Trips
          </div>
          <div class="nav-tab">
            <svg style="width:26px;height:26px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Chat
          </div>
          <div class="nav-tab">
            <svg style="width:26px;height:26px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Profile
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

// SCREENSHOT 2: CREATE ANY TRIP
const SCREENSHOT_2_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    ${CSS_RESET}
    .create-screen {
      padding: 110px 48px 48px;
      display: flex;
      flex-direction: column;
      gap: 28px;
      background: #0d1210;
      height: 100%;
    }
    .input-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .section-label {
      font-size: 20px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #34d399;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .chips-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .dest-chip {
      padding: 14px 24px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.06);
      border: 1.5px solid rgba(255, 255, 255, 0.1);
      font-size: 21px;
      font-weight: 600;
      color: #cbd5e1;
    }
    .dest-chip.active {
      background: #10b981;
      border-color: #10b981;
      color: #000000;
      font-weight: 700;
    }
    .vibe-card {
      flex: 1;
      min-width: 130px;
      padding: 18px 14px;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.05);
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      font-weight: 600;
      color: #cbd5e1;
    }
    .vibe-card.active {
      background: rgba(16, 185, 129, 0.15);
      border-color: #10b981;
      color: #34d399;
    }
    .split-box {
      background: rgba(255, 255, 255, 0.04);
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: 28px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  </style>
</head>
<body>
  <div class="ambient-glow"></div>
  
  <div class="marketing-header">
    <div class="marketing-tag">
      🗺️ Discover & Host Trips
    </div>
    <h1 class="marketing-title">Post Your Trip.<br/><span>Pick Your Travel Vibe.</span></h1>
    <p class="marketing-subtitle">Set your destination, departure dates, transport split, and budget in under 30 seconds.</p>
  </div>

  <div class="device-wrapper">
    <div class="device-screen">
      <div class="status-bar">
        <span>9:41</span>
        <div class="status-icons">5G &nbsp; 100%</div>
      </div>
      <div class="dynamic-island"></div>

      <div class="create-screen">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="font-size: 40px; font-weight: 800; color: #FFFFFF;">Host a Trip</h2>
            <p style="font-size: 21px; color: #94a3b8; margin-top: 4px;">Find reliable travel companions</p>
          </div>
          <span style="font-size: 22px; color: #34d399; font-weight: 700;">30s Setup</span>
        </div>

        <!-- Destination -->
        <div class="input-section">
          <div class="section-label">📍 Destination</div>
          <div class="chips-grid">
            <div class="dest-chip active">Goa</div>
            <div class="dest-chip">Coorg</div>
            <div class="dest-chip">Gokarna</div>
            <div class="dest-chip">Rishikesh</div>
            <div class="dest-chip">Manali</div>
            <div class="dest-chip">+ Custom City</div>
          </div>
        </div>

        <!-- Travel Vibe -->
        <div class="input-section">
          <div class="section-label">✨ Travel Vibe</div>
          <div style="display: flex; gap: 14px;">
            <div class="vibe-card active">
              <span style="font-size: 32px;">🏖️</span>
              Beach
            </div>
            <div class="vibe-card">
              <span style="font-size: 32px;">🚗</span>
              Roadtrip
            </div>
            <div class="vibe-card">
              <span style="font-size: 32px;">🥾</span>
              Trek
            </div>
            <div class="vibe-card">
              <span style="font-size: 32px;">⛺</span>
              Camping
            </div>
          </div>
        </div>

        <!-- Ride & Cost Split -->
        <div class="split-box">
          <div class="section-label">🚘 Transport Split</div>
          <div style="font-size: 24px; font-weight: 700; color: #FFFFFF;">
            Self-Drive SUV / Carpool Split
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.08);">
            <div>
              <span style="font-size: 19px; color: #94a3b8;">Est. Daily Budget</span>
              <div style="font-size: 28px; font-weight: 800; color: #34d399;">₹1,800 / day</div>
            </div>
            <div>
              <span style="font-size: 19px; color: #94a3b8;">Spots Open</span>
              <div style="font-size: 28px; font-weight: 800; color: #FFFFFF;">2 Travelers</div>
            </div>
          </div>
        </div>

        <!-- Female-only filter option -->
        <div style="background: rgba(147, 51, 234, 0.12); border: 1.5px solid rgba(147, 51, 234, 0.35); border-radius: 24px; padding: 22px; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <span style="font-size: 28px;">🛡️</span>
            <div>
              <div style="font-size: 22px; font-weight: 700; color: #FFFFFF;">Female-Only Trip</div>
              <div style="font-size: 18px; color: #cbd5e1;">Visible strictly to verified women</div>
            </div>
          </div>
          <div style="width: 58px; height: 34px; border-radius: 9999px; background: #9333ea; position: relative;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: #FFFFFF; position: absolute; right: 3px; top: 3px;"></div>
          </div>
        </div>

        <div style="margin-top: auto; padding-bottom: 50px;">
          <div style="height: 86px; background: #10b981; border-radius: 28px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; color: #000000; box-shadow: 0 12px 30px rgba(16, 185, 129, 0.4);">
            Publish Trip & Invite Crew ✈️
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

// SCREENSHOT 3: DIRECT TRIP CHAT
const SCREENSHOT_3_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    ${CSS_RESET}
    .chat-screen {
      padding: 110px 44px 44px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      background: #0d1210;
      height: 100%;
    }
    .chat-header {
      display: flex;
      align-items: center;
      gap: 18px;
      padding-bottom: 20px;
      border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
    }
    .chat-bubble {
      max-width: 82%;
      padding: 22px 28px;
      border-radius: 30px;
      font-size: 23px;
      line-height: 1.45;
    }
    .chat-bubble.left {
      background: rgba(255, 255, 255, 0.08);
      border-bottom-left-radius: 8px;
      align-self: flex-start;
      color: #f1f5f9;
    }
    .chat-bubble.right {
      background: #10b981;
      color: #000000;
      font-weight: 500;
      border-bottom-right-radius: 8px;
      align-self: flex-end;
    }
    .trip-badge-pinned {
      background: rgba(16, 185, 129, 0.12);
      border: 1.5px solid rgba(16, 185, 129, 0.35);
      border-radius: 22px;
      padding: 18px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 21px;
    }
    .chat-input-bar {
      margin-top: auto;
      background: rgba(255, 255, 255, 0.06);
      border: 1.5px solid rgba(255, 255, 255, 0.12);
      border-radius: 35px;
      height: 80px;
      padding: 0 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 22px;
      color: #64748b;
      margin-bottom: 30px;
    }
  </style>
</head>
<body>
  <div class="ambient-glow"></div>
  
  <div class="marketing-header">
    <div class="marketing-tag">
      💬 Direct Trip Coordination
    </div>
    <h1 class="marketing-title">Instant Chat.<br/><span>Plan The Journey.</span></h1>
    <p class="marketing-subtitle">Once the host accepts your request, direct chat unlocks immediately to plan logistics.</p>
  </div>

  <div class="device-wrapper">
    <div class="device-screen">
      <div class="status-bar">
        <span>9:41</span>
        <div class="status-icons">5G &nbsp; 100%</div>
      </div>
      <div class="dynamic-island"></div>

      <div class="chat-screen">
        <div class="chat-header">
          <div style="width: 68px; height: 68px; border-radius: 50%; background-image: url('${heroPhoto}'); background-size: cover; border: 2px solid #10b981;"></div>
          <div>
            <h2 style="font-size: 32px; font-weight: 800; color: #FFFFFF;">Tanya Sen &nbsp;<span style="color:#34d399; font-size:24px;">✓</span></h2>
            <p style="font-size: 19px; color: #34d399; font-weight: 600;">Trip Host &middot; Goa Beach Escape</p>
          </div>
        </div>

        <div class="trip-badge-pinned">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span>📍</span>
            <span style="font-weight: 700; color: #FFFFFF;">Goa Beach Villa (Oct 2 &ndash; 6)</span>
          </div>
          <span style="color: #34d399; font-weight: 700;">Request Accepted ✓</span>
        </div>

        <div class="chat-bubble left">
          Hey! Excited you're joining the Goa trip. We're picking up the rented Thar from Koramangala on Friday morning.
        </div>

        <div class="chat-bubble right">
          Awesome! I live right by Indiranagar so I can meet you guys at the 6 AM departure point.
        </div>

        <div class="chat-bubble left">
          Perfect! I've already locked in the North Goa pool villa in Vagator. Let's do a quick audio call tonight to finalize the beach itinerary!
        </div>

        <div class="chat-bubble right">
          Sounds great! Bringing my beach speaker and camera gear 🏖️
        </div>

        <div class="chat-input-bar">
          <span>Type a message to your travel crew...</span>
          <div style="display: flex; gap: 16px; align-items: center;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; color: #000000; font-weight: 700;">↑</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

// SCREENSHOT 4: SAFE & VERIFIED TRAVEL
const SCREENSHOT_4_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    ${CSS_RESET}
    .profile-card-container {
      position: relative;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 44px;
    }
    .profile-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 40%, rgba(10,14,12,0.95) 85%, #0a0e0c 100%);
      z-index: 2;
    }
    .profile-card-content {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 90px;
    }
    .trip-badge-live {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(16, 185, 129, 0.2);
      border: 1.5px solid rgba(16, 185, 129, 0.6);
      backdrop-filter: blur(10px);
      color: #34d399;
      padding: 10px 22px;
      border-radius: 9999px;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 1.5px;
      align-self: flex-start;
    }
    .btn-meet-trip {
      flex: 1;
      height: 86px;
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      border-radius: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      font-size: 28px;
      font-weight: 800;
      color: #000000;
      box-shadow: 0 12px 30px rgba(16, 185, 129, 0.4);
    }
  </style>
</head>
<body>
  <div class="ambient-glow"></div>
  
  <div class="marketing-header">
    <div class="marketing-tag">
      🛡️ Verified & Safe Travel
    </div>
    <h1 class="marketing-title">Safe Community.<br/><span>Verified Profiles.</span></h1>
    <p class="marketing-subtitle">Host approval gates, profile verification, and female-only trip circles keep every adventure safe.</p>
  </div>

  <div class="device-wrapper">
    <div class="device-screen">
      <div class="status-bar">
        <span>9:41</span>
        <div class="status-icons">5G &nbsp; 100%</div>
      </div>
      <div class="dynamic-island"></div>

      <div class="profile-card-container" style="background-image: url('${bioPhoto}');">
        <div class="profile-overlay"></div>
        <div class="profile-card-content">
          <div class="trip-badge-live">
            📍 HOSTING: COORG &middot; SEP 28
          </div>

          <div>
            <h2 style="font-size: 52px; font-weight: 900; color: #FFFFFF;">Ananya Sharma, 24 &nbsp;<span style="color:#34d399; font-size:38px;">✓</span></h2>
            <p style="font-size: 24px; color: rgba(255, 255, 255, 0.8); font-weight: 500;">Product Designer &middot; Indiranagar, Bangalore</p>
          </div>

          <div style="background: rgba(16, 185, 129, 0.12); border: 1.5px solid rgba(16, 185, 129, 0.35); border-radius: 24px; padding: 20px 26px; display: flex; align-items: center; gap: 16px; font-size: 22px; font-weight: 600; color: #34d399;">
            <span style="font-size: 26px;">🛡️</span>
            <span><strong>Verified Traveler:</strong> Phone verified &middot; Zero tolerance moderation</span>
          </div>

          <p style="font-size: 22px; color: rgba(255,255,255,0.85); line-height: 1.4;">
            "Always down for weekend road trips, sunrise mountain hikes, and scouting quaint coffee estate stays."
          </p>

          <div style="display: flex; flex-wrap: wrap; gap: 12px;">
            <span style="background: rgba(255,255,255,0.12); padding: 10px 20px; border-radius: 16px; font-size: 20px; color: #e2e8f0;">🏔️ Mountain Treks</span>
            <span style="background: rgba(255,255,255,0.12); padding: 10px 20px; border-radius: 16px; font-size: 20px; color: #e2e8f0;">☕ Coffee Plantations</span>
            <span style="background: rgba(255,255,255,0.12); padding: 10px 20px; border-radius: 16px; font-size: 20px; color: #e2e8f0;">🏍️ Enfield Rides</span>
            <span style="background: rgba(255,255,255,0.12); padding: 10px 20px; border-radius: 16px; font-size: 20px; color: #e2e8f0;">📸 Photography</span>
          </div>

          <div style="display: flex; gap: 20px; align-items: center; margin-top: 10px;">
            <div class="btn-meet-trip">
              <svg style="width:28px;height:28px;" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
              Meet for Trips
            </div>
            <div style="width: 86px; height: 86px; border-radius: 28px; background: rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-size: 32px;">
              ⋯
            </div>
          </div>
        </div>

        <div class="bottom-nav">
          <div class="nav-tab">
            <svg style="width:26px;height:26px;" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
            Trips
          </div>
          <div class="nav-tab active">
            <svg style="width:26px;height:26px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m16 8-8 8"/></svg>
            Meet People
          </div>
          <div class="nav-tab">
            <svg style="width:26px;height:26px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>
            My Trips
          </div>
          <div class="nav-tab">
            <svg style="width:26px;height:26px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Chat
          </div>
          <div class="nav-tab">
            <svg style="width:26px;height:26px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Profile
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

async function generateScreenshots() {
  console.log('Launching browser via Playwright with system Chrome...');
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1284, height: 2778 },
    deviceScaleFactor: 1,
  });

  const screens = [
    { name: '01_hero.png', html: SCREENSHOT_1_HTML },
    { name: '02_standards.png', html: SCREENSHOT_2_HTML },
    { name: '03_intention_exchange.png', html: SCREENSHOT_3_HTML },
    { name: '04_verified.png', html: SCREENSHOT_4_HTML },
  ];

  for (const screen of screens) {
    const page = await context.newPage();
    await page.setContent(screen.html, { waitUntil: 'load' });
    await page.waitForTimeout(500);
    const dest = path.join(OUT_DIR, screen.name);
    await page.screenshot({ path: dest, type: 'png' });
    console.log(`Generated: ${dest}`);
    await page.close();
  }

  await browser.close();
  console.log('All 4 Travel App Store screenshots successfully generated!');
}

generateScreenshots().catch((err) => {
  console.error('Error generating screenshots:', err);
  process.exit(1);
});
