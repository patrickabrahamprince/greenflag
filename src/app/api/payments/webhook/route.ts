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

  const body = await request.json();
  const { razorpay_order_id, razorpay_payment_id, status, connection_id } = body;

  if (status === "paid") {
    await supabase
      .from("payments")
      .update({ razorpay_payment_id, status: "completed" })
      .eq("razorpay_order_id", razorpay_order_id);

    await supabase
      .from("connections")
      .update({ streak_frozen: true })
      .eq("id", connection_id);
  }

  return NextResponse.json({ received: true });
}
