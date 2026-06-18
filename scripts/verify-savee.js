const fs = require('fs');
const path = require('path');

// Checks for src/components/savee/DiscoverCard.tsx since project uses a src/ folder structure
const targetPath = path.join(__dirname, '../src/components/savee/DiscoverCard.tsx');

if (!fs.existsSync(targetPath)) {
  console.error(`CRITICAL BUILD ERROR: DiscoverCard.tsx is missing at ${targetPath}`);
  process.exit(1);
} else {
  console.log("DiscoverCard.tsx verified successfully.");
  process.exit(0);
}
