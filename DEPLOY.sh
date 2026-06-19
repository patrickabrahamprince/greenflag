#!/bin/bash
set -e

echo "🚩 Building GreenFlag Next.js app..."

npm install
npm run build

echo "✅ Build complete. Deploying to Vercel..."

npx vercel --prod

echo "🚀 Deployed successfully!"
