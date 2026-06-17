import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP required" }, { status: 400 });
    }

    if (!env.supabaseServiceRole) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const supabase = createClient(
      env.supabaseUrl,
      env.supabaseServiceRole,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: otpRecord } = await supabase
      .from("phone_otps")
      .select("*")
      .eq("phone", phone)
      .eq("otp", otp)
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    await supabase
      .from("phone_otps")
      .update({ verified: true })
      .eq("id", otpRecord.id);

    const password = crypto.randomUUID().slice(0, 16);
    const email = `${phone.replace(/[^0-9]/g, "")}@app.greenflag`;

    const { data: existing } = await supabase.auth.admin.listUsers();
    const existingUser = existing?.users.find((u: any) => u.email === email);

    if (existingUser) {
      await supabase.auth.admin.updateUserById(existingUser.id, {
        password,
        email_confirm: true,
      });
    } else {
      const { error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ email, password });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Verification failed" }, { status: 500 });
  }
}
