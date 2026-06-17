import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendSMS } from "@/lib/twilio";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    // Dynamic key access to prevent static inlining by Turbopack
    const envKey = "SUPABASE_SERVICE_ROLE";
    const serviceRole = process.env[envKey];
    if (!serviceRole) {
      return NextResponse.json({
        error: "Service role not available",
        hasNextPublicUrl: !!process.env["NEXT_PUBLIC_SUPABASE_URL"],
        keys: Object.keys(process.env).filter(k => k.includes("SUPABASE") || k.includes("TWILIO") || k.startsWith("NEXT_PUBLIC")),
      }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRole,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Expire old OTPs for this phone
    await supabase
      .from("phone_otps")
      .update({ verified: true })
      .eq("phone", phone)
      .eq("verified", false);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP
    const { error: insertError } = await supabase.from("phone_otps").insert({
      phone,
      otp,
      expires_at: new Date(Date.now() + 5 * 60000).toISOString(),
    });

    if (insertError) {
      return NextResponse.json({ error: "Failed to create OTP" }, { status: 500 });
    }

    // Send SMS
    await sendSMS(phone, `Your Greenflag verification code is: ${otp}. Valid for 5 minutes.`);

    return NextResponse.json({ sent: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to send OTP" }, { status: 500 });
  }
}
