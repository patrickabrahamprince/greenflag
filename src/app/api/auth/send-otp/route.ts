import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendSMS } from "@/lib/twilio";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    const serviceRole = process.env.SUPABASE_SERVICE_ROLE;
    if (!serviceRole) {
      const missing = [];
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
      if (!process.env.SUPABASE_SERVICE_ROLE) missing.push("SUPABASE_SERVICE_ROLE");
      if (!process.env.TWILIO_ACCOUNT_SID) missing.push("TWILIO_ACCOUNT_SID");
      if (!process.env.TWILIO_AUTH_TOKEN) missing.push("TWILIO_AUTH_TOKEN");
      if (!process.env.TWILIO_PHONE_NUMBER) missing.push("TWILIO_PHONE_NUMBER");
      return NextResponse.json({
        error: `Missing env vars: ${missing.join(", ")}`,
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
