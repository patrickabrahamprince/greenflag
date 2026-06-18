import Razorpay from "razorpay";
import { createClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

let razorpayClient: Razorpay | null = null;
function getRazorpay() {
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: env.razorpayKeyId || "rzp_test_placeholder",
      key_secret: env.razorpayKeySecret || "placeholder_secret",
    });
  }
  return razorpayClient;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pack_id } = await req.json();
  const { data: pack } = await supabase
    .from("coin_packs")
    .select()
    .eq("id", pack_id)
    .single();

  if (!pack) {
    return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
  }

  try {
    const order = await getRazorpay().orders.create({
      amount: pack.price_inr,
      currency: "INR",
      receipt: `${user.id}_${Date.now()}`,
      notes: { user_id: user.id, coins: pack.coins },
    });

    const { error: txError } = await supabase.from("coin_transactions").insert({
      user_id: user.id,
      amount_inr: pack.price_inr,
      coins_added: pack.coins,
      razorpay_order_id: order.id,
      status: "pending",
      source: "web",
    });

    if (txError) throw txError;

    return NextResponse.json({
      order_id: order.id,
      key_id: env.razorpayKeyId,
      amount: order.amount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
