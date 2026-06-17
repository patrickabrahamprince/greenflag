import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { connection_id } = await request.json();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const razorpayOrder = {
    id: "order_" + Date.now(),
    amount: 290000,
    currency: "INR",
  };

  const { data, error } = await supabase
    .from("payments")
    .insert({
      user_id: user.id,
      connection_id,
      razorpay_order_id: razorpayOrder.id,
      amount: 290000,
      type: "streak_freeze",
      status: "created",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: razorpayOrder, payment: data });
}
