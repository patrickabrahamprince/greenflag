// Single source of truth for Apple product id -> coin amount. These exact
// product ids must be created in App Store Connect as Consumable in-app
// purchases before purchases will resolve to anything on-device. Must stay
// in sync with the PACKAGES array in app/(guest)/coins/page.tsx -- a
// mismatch here means Apple charges the card and the server then rejects
// the credit with "Unknown product", so treat these as the same table.
export const APPLE_COIN_PRODUCTS: Record<string, number> = {
  'com.greenflagapp.app.coins500': 500,
  'com.greenflagapp.app.coins1000': 1000,
  'com.greenflagapp.app.coins1500': 1500,
  'com.greenflagapp.app.coins2000': 2000,
  'com.greenflagapp.app.coins5000': 5000,
};

export const APPLE_COIN_PRODUCT_IDS = Object.keys(APPLE_COIN_PRODUCTS);
