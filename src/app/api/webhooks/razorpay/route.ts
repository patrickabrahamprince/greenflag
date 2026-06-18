import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

const supabaseAdmin = createClient(
  env.supabaseUrl,
  env.supabaseServiceRole,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const expected = crypto
    .createHmac("sha256", env.razorpayWebhookSecret)
    .update(body)
    .digest("hex");

  if (signature !== expected) {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    const event = JSON.parse(body);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const { error } = await supabaseAdmin.rpc("credit_coins_on_payment", {
        p_rzp_payment_id: payment.id,
        p_rzp_order_id: payment.order_id,
      });

      if (error) {
        console.error("Credit failed:", error);
      }
    }

    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      await supabaseAdmin
        .from("coin_transactions")
        .update({ status: "failed" })
        .eq("razorpay_order_id", payment.order_id);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
