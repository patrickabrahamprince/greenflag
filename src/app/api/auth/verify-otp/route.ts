import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
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

    // Get the most recent unverified OTP
    const { data: records, error: fetchError } = await supabase
      .from("phone_otps")
      .select("*")
      .eq("phone", phone)
      .eq("otp", otp)
      .eq("verified", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError || !records || records.length === 0) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    // Mark the OTP as verified
    await supabase
      .from("phone_otps")
      .update({ verified: true })
      .eq("id", records[0].id);

    const password = crypto.randomUUID().slice(0, 16);
    const email = `${phone.replace(/[^0-9]/g, "")}@app.greenflag`;

    // Find if the user exists in auth
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ error: "Auth check failed", detail: listError.message }, { status: 500 });
    }

    const existingUser = usersData.users.find((u) => u.email === email);

    if (existingUser) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
        password,
        email_confirm: true,
      });
      if (updateError) {
        return NextResponse.json({ error: "Failed to update user credentials", detail: updateError.message }, { status: 500 });
      }
    } else {
      const { error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (createError) {
        return NextResponse.json({ error: "Failed to create user", detail: createError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ email, password });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Verification failed" }, { status: 500 });
  }
}
