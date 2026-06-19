#!/bin/bash
set -euo pipefail
export EAS_NO_VCS=1
echo "=== GREENFLAG 5AM DEPLOY ==="
echo "1. Running SQL: Copy SQL from src/app/admin.tsx top comment and run in Supabase"
echo "2. Exporting web..."
npx expo export -p web
echo "3. Deploying to Vercel..."
npx vercel --prod --yes
echo "4. Building mobile..."
eas build --platform all --profile production --non-interactive
echo "5. Submitting..."
eas submit -p ios --latest --non-interactive
eas submit -p android --latest --non-interactive
echo "=== DONE. CHECK EAS DASHBOARD FOR LINKS ==="
