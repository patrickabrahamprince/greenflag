import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendSMS } from "@/lib/twilio";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    if (!env.supabaseServiceRole) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const supabase = createClient(
      env.supabaseUrl,
      env.supabaseServiceRole,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    await supabase
      .from("phone_otps")
      .update({ verified: true })
      .eq("phone", phone)
      .eq("verified", false);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const { error: insertError } = await supabase.from("phone_otps").insert({
      phone,
      otp,
      expires_at: new Date(Date.now() + 5 * 60000).toISOString(),
    });

    if (insertError) {
      return NextResponse.json({ error: "Failed to create OTP", detail: `${insertError.code}: ${insertError.message}` }, { status: 500 });
    }

    await sendSMS(phone, `Your Greenflag verification code is: ${otp}. Valid for 5 minutes.`);

    return NextResponse.json({ sent: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to send OTP" }, { status: 500 });
  }
}
