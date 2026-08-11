// Stateless signed-cookie sessions. Uses Web Crypto (crypto.subtle) only, so
// this works unmodified in both the Edge middleware runtime and the Node
// runtime used by API routes — no Buffer, no server-side session store.

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function hexEncode(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmac(secret, data) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return hexEncode(sig);
}

export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function createSessionToken(secret) {
  const expiry = Date.now() + SESSION_TTL_MS;
  const sig = await hmac(secret, String(expiry));
  return `${expiry}.${sig}`;
}

export async function verifySessionToken(token, secret) {
  if (!token || !secret) return false;
  const [expiryStr, sig] = token.split('.');
  if (!expiryStr || !sig) return false;
  const expiry = Number(expiryStr);
  if (!Number.isFinite(expiry) || expiry < Date.now()) return false;
  const expectedSig = await hmac(secret, expiryStr);
  return timingSafeEqual(sig, expectedSig);
}
