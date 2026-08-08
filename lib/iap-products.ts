// Single source of truth for Apple product id -> coin amount. These exact
// product ids must be created in App Store Connect as Consumable in-app
// purchases before purchases will resolve to anything on-device.
export const APPLE_COIN_PRODUCTS: Record<string, number> = {
  'com.greenflagapp.app.coins500': 500,
  'com.greenflagapp.app.coins1200': 1200,
  'com.greenflagapp.app.coins2500': 2500,
  // Real-money end-to-end test at the smallest possible spend. Currently
  // visible to every account (see app/(guest)/coins/page.tsx) -- remove
  // or re-gate before App Review / public launch.
  'com.greenflagapp.app.coinstest': 5,
};

export const APPLE_COIN_PRODUCT_IDS = Object.keys(APPLE_COIN_PRODUCTS);
