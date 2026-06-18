// Verify Savee UI compliance
// Single import block
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 1️⃣ Verify SaveButton component exists
const saveButtonPath = path.join(__dirname, '..', 'src', 'components', 'save', 'SaveButton.tsx');
if (!fs.existsSync(saveButtonPath)) {
  console.error('❌ CRITICAL: SaveButton component missing at', saveButtonPath);
  process.exit(1);
} else {
  console.log('✅ SaveButton component found.');
}

// Helper: read file safely
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (_) {
    return '';
  }
}

// 2️⃣ Scan all page files
const appFiles = glob.sync('src/app/**/*.tsx', { cwd: path.join(__dirname, '..'), absolute: true });
let hasError = false;

appFiles.forEach((file) => {
  const content = readFile(file);

  // ----- SaveButton import check -----
  const usesSaveButton = /<SaveButton\b/.test(content);
  const hasImport = /import\s+SaveButton\s+from\s+['"]@\/components\/save\/SaveButton['"]/.test(content);
  if (usesSaveButton && !hasImport) {
    console.error(`❌ ${file}: SaveButton used without proper import.`);
    hasError = true;
  }

  // ----- Mounted guard check for client components with onClick -----
  const isClient = /['"]use client['"]/.test(content);
  const hasOnClick = /onClick\s*=/.test(content);
  if (isClient && hasOnClick) {
    const hasMountedState = /const\s*\[\s*mounted\s*,\s*setMounted\s*\]\s*=\s*useState\(\s*false\s*\)/.test(content);
    const hasMountedEffect = /useEffect\s*\(\s*\(\s*\)\s*=>\s*setMounted\(\s*true\s*\)\s*,\s*\[\s*\]\s*\)/.test(content);
    if (!hasMountedState || !hasMountedEffect) {
      console.error(`❌ ${file}: onClick used without mounted guard (useState+useEffect).`);
      hasError = true;
    }
  }
});

if (hasError) {
  console.error('❌ Savee UI verification failed.');
  process.exit(1);
}

console.log('✅ All Savee UI checks passed.');
process.exit(0);
