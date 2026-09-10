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
  margin-top: 150px;
  margin-bottom: 90px;
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
  margin-bottom: 36px;
}
.marketing-tag svg {
  width: 26px;
  height: 26px;
}
.marketing-title {
  font-size: 78px;
  font-weight: 800;
  line-height: 1.12;
  letter-spacing: -1.5px;
  color: #FFFFFF;
  margin-bottom: 24px;
}
.marketing-title span {
  background: linear-gradient(135deg, #10b981 0%, #34d399 50%, #fbbf24 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.marketing-subtitle {
  font-size: 34px;
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
  height: 2000px;
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

/* Card & UI details */
.discover-card {
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
.discover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 40%, rgba(10,14,12,0.95) 85%, #0a0e0c 100%);
  z-index: 2;
}
.discover-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 90px;
}
.alignment-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(212, 175, 55, 0.2);
  border: 1.5px solid rgba(212, 175, 55, 0.6);
  backdrop-filter: blur(10px);
  color: #fbbf24;
  padding: 10px 22px;
  border-radius: 9999px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1.5px;
  align-self: flex-start;
}
.profile-title {
  font-size: 52px;
  font-weight: 800;
  line-height: 1.15;
  color: #FFFFFF;
}
.profile-sub {
  font-size: 26px;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 500;
}
.standard-lock-banner {
  background: rgba(16, 185, 129, 0.12);
  border: 1.5px solid rgba(16, 185, 129, 0.35);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 20px 26px;
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 23px;
  font-weight: 600;
  color: #34d399;
}
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.tag-chip {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  padding: 10px 20px;
  border-radius: 16px;
  font-size: 20px;
  font-weight: 500;
  color: #e2e8f0;
}
.actions-row {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-top: 10px;
}
.btn-meet-standard {
  flex: 1;
  height: 86px;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 28px;
  font-weight: 700;
  color: #FFFFFF;
  box-shadow: 0 12px 30px rgba(16, 185, 129, 0.4);
}
.btn-skip-icon {
  width: 86px;
  height: 86px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 28px;
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

const SCREENSHOT_1_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>${CSS_RESET}</style>
</head>
<body>
  <div class="ambient-glow"></div>
  
  <div class="marketing-header">
    <div class="marketing-tag">
      <svg fill="currentColor" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>
      Values-First Discovery
    </div>
    <h1 class="marketing-title">Standards Before<br/><span>Small Talk</span></h1>
    <p class="marketing-subtitle">Curated profiles aligned by lifestyle, values, and mutual intentions — not mindless feeds.</p>
  </div>

  <div class="device-wrapper">
    <div class="device-screen">
      <div class="status-bar">
        <span>9:41</span>
        <div class="status-icons">5G &nbsp; 100%</div>
      </div>
      <div class="dynamic-island"></div>

      <div class="discover-card" style="background-image: url('${heroPhoto}');">
        <div class="discover-overlay"></div>
        <div class="discover-content">
          <div class="alignment-pill">
            ★ 94% ALIGNMENT
          </div>

          <div>
            <h2 class="profile-title">Aarohi, 25 &nbsp;<span style="color:#34d399; font-size:38px;">✓</span></h2>
            <p class="profile-sub">Architect &middot; South Mumbai</p>
          </div>

          <div class="standard-lock-banner">
            <span style="font-size: 28px;">🔒</span>
            <span><strong>3-Day Standard:</strong> Chat unlocks only after completing her 3 intentions</span>
          </div>

          <p style="font-size: 22px; color: rgba(255,255,255,0.85); line-height: 1.4;">
            "Seeking genuine ambition, honesty over comfort, and weekend architecture walks."
          </p>

          <div class="tags-row">
            <span class="tag-chip">🌿 Mindful Living</span>
            <span class="tag-chip">🏛 Architecture</span>
            <span class="tag-chip">☕ Early Mornings</span>
            <span class="tag-chip">📚 Deep Books</span>
          </div>

          <div class="actions-row">
            <div class="btn-meet-standard">
              <svg style="width:28px;height:28px;" fill="currentColor" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>
              Meet Her Standard
            </div>
            <div class="btn-skip-icon">
              →
            </div>
          </div>
        </div>

        <div class="bottom-nav">
          <div class="nav-tab active">
            <svg style="width:26px;height:26px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m16 8-8 8"/></svg>
            Discover
          </div>
          <div class="nav-tab">
            <svg style="width:26px;height:26px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            Activity
          </div>
          <div class="nav-tab">
            <svg style="width:26px;height:26px;" fill="currentColor" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>
            Standards
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

const SCREENSHOT_2_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    ${CSS_RESET}
    .builder-screen {
      padding: 120px 48px 48px;
      display: flex;
      flex-direction: column;
      gap: 30px;
      background: #0d1210;
      height: 100%;
    }
    .builder-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .day-selector {
      display: flex;
      gap: 16px;
      margin-top: 10px;
    }
    .day-pill {
      flex: 1;
      padding: 16px 20px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.06);
      border: 1.5px solid rgba(255, 255, 255, 0.1);
      text-align: center;
      font-size: 22px;
      font-weight: 600;
      color: #94a3b8;
    }
    .day-pill.active {
      background: rgba(16, 185, 129, 0.15);
      border-color: #10b981;
      color: #34d399;
    }
    .intention-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: 28px;
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .intention-card.highlight {
      border-color: rgba(16, 185, 129, 0.4);
      background: rgba(16, 185, 129, 0.05);
    }
    .intention-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      font-weight: 700;
      color: #fbbf24;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
  </style>
</head>
<body>
  <div class="ambient-glow"></div>
  
  <div class="marketing-header">
    <div class="marketing-tag">
      <svg fill="currentColor" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>
      Intentional Protocol
    </div>
    <h1 class="marketing-title">Define Your Standard<br/><span>She Sets The Pace</span></h1>
    <p class="marketing-subtitle">Women define a 3-day standard: one thought, one image, one voice note before chat opens.</p>
  </div>

  <div class="device-wrapper">
    <div class="device-screen">
      <div class="status-bar">
        <span>9:41</span>
        <div class="status-icons">5G &nbsp; 100%</div>
      </div>
      <div class="dynamic-island"></div>

      <div class="builder-screen">
        <div class="builder-header">
          <div>
            <h2 style="font-size: 40px; font-weight: 800; color: #FFFFFF;">Build Your Standard</h2>
            <p style="font-size: 22px; color: #94a3b8; margin-top: 6px;">Intentions required before conversation unlocks</p>
          </div>
          <span style="font-size: 22px; color: #34d399; font-weight: 700;">Saved ✓</span>
        </div>

        <div class="day-selector">
          <div class="day-pill active">Day 1: Thought</div>
          <div class="day-pill">Day 2: Image</div>
          <div class="day-pill">Day 3: Voice</div>
        </div>

        <div class="intention-card highlight">
          <div class="intention-badge">
            <span>💭</span> Day 1 &middot; Core Values Prompt
          </div>
          <p style="font-size: 28px; font-weight: 600; color: #FFFFFF; line-height: 1.35;">
            "What is a core value you will never compromise in a partnership?"
          </p>
          <div style="background: rgba(0,0,0,0.3); border-radius: 18px; padding: 20px; font-size: 20px; color: #94a3b8;">
            He must answer thoughtfully in writing before Day 2 is revealed.
          </div>
        </div>

        <div class="intention-card">
          <div class="intention-badge">
            <span>📷</span> Day 2 &middot; Authentic Reality
          </div>
          <p style="font-size: 26px; font-weight: 600; color: #e2e8f0; line-height: 1.35;">
            "A candid photo showing you doing something you genuinely love."
          </p>
          <p style="font-size: 19px; color: #64748b;">Requires approval before Day 3 unlocks.</p>
        </div>

        <div class="intention-card">
          <div class="intention-badge">
            <span>🎙</span> Day 3 &middot; Voice & Presence
          </div>
          <p style="font-size: 26px; font-weight: 600; color: #e2e8f0; line-height: 1.35;">
            "Tell me about a moment that completely changed your perspective."
          </p>
          <p style="font-size: 19px; color: #64748b;">Complete all 3 days to unlock unlimited messaging.</p>
        </div>

        <div style="margin-top: auto; padding-bottom: 50px;">
          <div class="btn-meet-standard" style="box-shadow: 0 12px 30px rgba(16, 185, 129, 0.4);">
            Activate 3-Day Standard
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

const SCREENSHOT_3_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    ${CSS_RESET}
    .task-screen {
      padding: 120px 48px 48px;
      display: flex;
      flex-direction: column;
      gap: 28px;
      background: #0d1210;
      height: 100%;
    }
    .timeline-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      margin: 20px 20px 30px;
    }
    .timeline-line {
      position: absolute;
      left: 30px;
      right: 30px;
      height: 4px;
      background: rgba(255, 255, 255, 0.15);
      z-index: 1;
    }
    .timeline-progress {
      position: absolute;
      left: 30px;
      width: 50%;
      height: 4px;
      background: #10b981;
      z-index: 2;
    }
    .step-node {
      position: relative;
      z-index: 3;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #1e2923;
      border: 3px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 700;
      color: #94a3b8;
    }
    .step-node.done {
      background: #059669;
      border-color: #34d399;
      color: #FFFFFF;
    }
    .step-node.active {
      background: #fbbf24;
      border-color: #fef08a;
      color: #000000;
    }
  </style>
</head>
<body>
  <div class="ambient-glow"></div>
  
  <div class="marketing-header">
    <div class="marketing-tag">
      <svg fill="currentColor" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>
      Anti-Ghosting System
    </div>
    <h1 class="marketing-title">3 Days Of Intention<br/><span>Then You Connect</span></h1>
    <p class="marketing-subtitle">Chat unlocks only after both people complete the 3-day protocol. Sincerity is currency.</p>
  </div>

  <div class="device-wrapper">
    <div class="device-screen">
      <div class="status-bar">
        <span>9:41</span>
        <div class="status-icons">5G &nbsp; 100%</div>
      </div>
      <div class="dynamic-island"></div>

      <div class="task-screen">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background-image: url('${interestsPhoto}'); background-size: cover;"></div>
          <div>
            <h2 style="font-size: 34px; font-weight: 800; color: #FFFFFF;">Kavya's Standard</h2>
            <p style="font-size: 20px; color: #34d399; font-weight: 600;">Day 2 in Progress &middot; 14h Left to Review</p>
          </div>
        </div>

        <div class="timeline-bar">
          <div class="timeline-line"></div>
          <div class="timeline-progress"></div>
          <div class="step-node done">✓</div>
          <div class="step-node active">2</div>
          <div class="step-node">3</div>
          <div class="step-node">🔒</div>
        </div>

        <div style="background: rgba(255,255,255,0.05); border: 1.5px solid rgba(16,185,129,0.3); border-radius: 28px; padding: 30px; display: flex; flex-direction: column; gap: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 20px; font-weight: 700; color: #fbbf24; text-transform: uppercase;">His Day 2 Submission</span>
            <span style="font-size: 18px; color: #94a3b8;">Pending Your Review</span>
          </div>

          <p style="font-size: 22px; color: rgba(255,255,255,0.7);">Prompt: <em>"A candid photo showing your genuine passion"</em></p>

          <div style="width: 100%; height: 380px; border-radius: 20px; background-image: url('${bioPhoto}'); background-size: cover; background-position: center; position: relative;">
            <div style="position: absolute; bottom: 0; inset-inline: 0; padding: 20px; background: linear-gradient(transparent, rgba(0,0,0,0.85)); border-radius: 0 0 20px 20px; font-size: 20px; color: #FFFFFF;">
              "Restoring vintage 35mm cameras on Sunday mornings — patience in every detail."
            </div>
          </div>
        </div>

        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 20px; padding: 20px 24px; display: flex; align-items: center; gap: 16px; font-size: 20px; color: #34d399;">
          <span>🛡</span>
          <span>Day 3 opens once you approve. If rejected, connection ends cleanly.</span>
        </div>

        <div style="display: flex; gap: 16px; margin-top: auto; padding-bottom: 40px;">
          <div style="flex: 1; height: 80px; border-radius: 24px; background: linear-gradient(135deg, #059669 0%, #10b981 100%); display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700; color: #FFFFFF; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.4);">
            Approve & Unlock Day 3
          </div>
          <div style="width: 180px; height: 80px; border-radius: 24px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 600; color: #ef4444;">
            End Connection
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

const SCREENSHOT_4_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    ${CSS_RESET}
    .chat-screen {
      padding: 110px 40px 30px;
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #0d1210;
    }
    .chat-header {
      display: flex;
      align-items: center;
      gap: 20px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .unlocked-banner {
      background: rgba(212, 175, 55, 0.12);
      border: 1.5px solid rgba(212, 175, 55, 0.35);
      border-radius: 20px;
      padding: 18px 24px;
      margin: 20px 0;
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 20px;
      color: #fbbf24;
      font-weight: 600;
    }
    .prompt-spark-card {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 20px;
      padding: 20px 24px;
      margin-bottom: 24px;
      font-size: 20px;
      color: #e2e8f0;
    }
    .chat-bubble {
      max-width: 80%;
      padding: 20px 26px;
      border-radius: 26px;
      font-size: 23px;
      line-height: 1.4;
      margin-bottom: 18px;
    }
    .chat-bubble.left {
      background: rgba(255, 255, 255, 0.08);
      color: #FFFFFF;
      align-self: flex-start;
      border-bottom-left-radius: 6px;
    }
    .chat-bubble.right {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: #FFFFFF;
      align-self: flex-end;
      border-bottom-right-radius: 6px;
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
      <svg fill="currentColor" viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>
      Mindful Communication
    </div>
    <h1 class="marketing-title">Earned Conversations<br/><span>Rooted In Substance</span></h1>
    <p class="marketing-subtitle">No superficial opening lines. Conversations begin with established respect and mutual values.</p>
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
          <div style="width: 68px; height: 68px; border-radius: 50%; background-image: url('${heroPhoto}'); background-size: cover;"></div>
          <div>
            <h2 style="font-size: 32px; font-weight: 800; color: #FFFFFF;">Aarohi &nbsp;<span style="color:#34d399; font-size:24px;">✓</span></h2>
            <p style="font-size: 19px; color: #34d399; font-weight: 600;">3-Day Standard Completed &middot; Chat Unlocked</p>
          </div>
        </div>

        <div class="unlocked-banner">
          <span>✨</span>
          <span><strong>Mutual Alignment:</strong> You both completed all 3 days with sincerity.</span>
        </div>

        <div class="prompt-spark-card">
          <div style="font-size: 17px; color: #fbbf24; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">Shared Interest Spark</div>
          You both share a passion for architectural restoration and early morning coffee.
        </div>

        <div class="chat-bubble left">
          I loved your answer on Day 2 about restoration. It showed so much patience and attention to detail.
        </div>

        <div class="chat-bubble right">
          Thank you, Aarohi! That means a lot. Your Day 1 standard about honesty over comfort was so refreshing to read.
        </div>

        <div class="chat-bubble left">
          It took me a long time to learn that honesty is kindness. Do you have a favorite heritage building in South Mumbai?
        </div>

        <div class="chat-input-bar">
          <span>Write an intentional reply...</span>
          <div style="display: flex; gap: 16px; align-items: center;">
            <span>🎙</span>
            <div style="width: 48px; height: 48px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; color: #FFFFFF; font-weight: 700;">↑</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

async function generateScreenshots() {
  console.log('Launching browser via Playwright...');
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
  console.log('All 4 App Store screenshots successfully generated!');
}

generateScreenshots().catch((err) => {
  console.error('Error generating screenshots:', err);
  process.exit(1);
});
