import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import path from 'path';
import { SignedDataVerifier, Environment } from '@apple/app-store-server-library';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { APPLE_COIN_PRODUCTS } from '@/lib/iap-products';

const BUNDLE_ID = 'com.greenflagapp.app';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Root certs are Apple's own public PKI material (not secrets) --
// downloaded from https://www.apple.com/certificateauthority/ and
// committed under certs/apple-root-ca/. verifyAndDecodeTransaction()
// checks the JWS signature chain against these locally; no App Store
// Server API key is needed just to verify a transaction a device already
// handed us (that key would only be needed for things like refund
// lookups or server-initiated subscription status checks, neither of
// which this consumable-coins flow needs).
function loadAppleRootCertificates(): Buffer[] {
  const dir = path.join(process.cwd(), 'certs', 'apple-root-ca');
  return ['AppleRootCA-G3.cer', 'AppleRootCA-G2.cer'].map((file) => readFileSync(path.join(dir, file)));
}

// TestFlight builds produce Sandbox transactions, real App Store
// purchases produce Production ones -- verifyAndDecodeTransaction()
// rejects a transaction whose embedded environment doesn't match what
// the verifier was constructed with, so one endpoint has to be able to
// handle either. Try Production first (the common case once shipped),
// fall back to Sandbox only on an environment mismatch.
async function verifyTransaction(jwsRepresentation: string) {
  const rootCerts = loadAppleRootCertificates();
  try {
    const verifier = new SignedDataVerifier(rootCerts, true, Environment.PRODUCTION, BUNDLE_ID);
    return await verifier.verifyAndDecodeTransaction(jwsRepresentation);
  } catch {
    const sandboxVerifier = new SignedDataVerifier(rootCerts, true, Environment.SANDBOX, BUNDLE_ID);
    return await sandboxVerifier.verifyAndDecodeTransaction(jwsRepresentation);
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jwsRepresentation } = await req.json();
    if (!jwsRepresentation || typeof jwsRepresentation !== 'string') {
      return NextResponse.json({ error: 'jwsRepresentation is required' }, { status: 400 });
    }

    let decoded;
    try {
      decoded = await verifyTransaction(jwsRepresentation);
    } catch (err) {
      console.error('Apple transaction verification failed:', err);
      return NextResponse.json({ error: 'Could not verify transaction with Apple' }, { status: 400 });
    }

    const productId = decoded.productId;
    const transactionId = decoded.transactionId;
    if (!productId || !transactionId) {
      return NextResponse.json({ error: 'Malformed transaction' }, { status: 400 });
    }

    const coins = APPLE_COIN_PRODUCTS[productId];
    if (!coins) {
      return NextResponse.json({ error: `Unknown product: ${productId}` }, { status: 400 });
    }

    const admin = getAdmin();
    const { data: result, error: creditErr } = await admin.rpc('credit_coins_idempotent_apple', {
      p_user_id: user.id,
      p_amount: coins,
      p_description: `Purchased ${coins} coins (Apple IAP)`,
      p_apple_transaction_id: transactionId,
    });

    if (creditErr || !result) {
      console.error('credit_coins_idempotent_apple RPC error:', creditErr);
      return NextResponse.json({ error: 'Failed to credit coins' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      new_balance: (result as { new_balance: number }).new_balance,
    });
  } catch (error) {
    console.error('Apple purchase verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
