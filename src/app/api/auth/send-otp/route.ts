import { NextResponse } from "next/server";
import { sendSMS } from "@/lib/twilio";
import { env } from "@/lib/env";

const headers = {
  apikey: env.supabaseServiceRole,
  Authorization: `Bearer ${env.supabaseServiceRole}`,
  "Content-Type": "application/json",
  Accept: "application/json",
  "Accept-Profile": "public",
  "Content-Profile": "public",
};

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    if (!env.supabaseServiceRole) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    // Mark any existing unverified OTPs as verified
    await fetch(`${env.supabaseUrl}/rest/v1/phone_otps?phone=eq.${encodeURIComponent(phone)}&verified=eq.false`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ verified: true }),
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const res = await fetch(`${env.supabaseUrl}/rest/v1/phone_otps`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify({
        phone,
        otp,
        expires_at: new Date(Date.now() + 5 * 60000).toISOString(),
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(
        { error: "Failed to create OTP", detail: err.message || res.statusText },
        { status: 500 }
      );
    }

    if (env.twilioAccountSid && env.twilioAuthToken && env.twilioPhoneNumber) {
      try {
        await sendSMS(phone, `Your Greenflag verification code is: ${otp}. Valid for 5 minutes.`);
      } catch (smsErr: any) {
        return NextResponse.json({ sent: true, otp, smsError: smsErr.message });
      }
    }

    return NextResponse.json({ sent: true, otp });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to send OTP" }, { status: 500 });
  }
}
