// Verify Savee UI compliance — SSR-safe architecture
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

// 2️⃣ Verify SaveButton does NOT have a mounted early return
const saveButtonContent = readFile(saveButtonPath);
if (/if\s*\(!\s*mounted\s*\)\s*return/.test(saveButtonContent)) {
  console.error('❌ SaveButton.tsx: mounted early return detected. Mounted must only gate event handlers, never the component return.');
  process.exit(1);
}
console.log('✅ SaveButton has no mounted early return (SSR-safe).');

// 3️⃣ Verify SaveButton always renders a <button> (no conditional return)
const returns = (saveButtonContent.match(/return\s*\(/g) || []).length;
if (returns !== 1) {
  console.error(`❌ SaveButton.tsx: expected 1 return statement (unconditional), found ${returns}.`);
  process.exit(1);
}
console.log('✅ SaveButton has exactly one return (unconditional render).');

// 4️⃣ Scan all page files for SaveButton usage without import
const appFiles = glob.sync('src/app/**/*.tsx', { cwd: path.join(__dirname, '..'), absolute: true });
let hasError = false;

appFiles.forEach((file) => {
  const content = readFile(file);

  const usesSaveButton = /<SaveButton\b/.test(content);
  const hasImport = /import\s+SaveButton\s+from\s+['"]@\/components\/save\/SaveButton['"]/.test(content);
  if (usesSaveButton && !hasImport) {
    console.error(`❌ ${file}: SaveButton used without proper import.`);
    hasError = true;
  }
});

if (hasError) {
  console.error('❌ Savee UI verification failed.');
  process.exit(1);
}

console.log('✅ All Savee UI checks passed.');
process.exit(0);
