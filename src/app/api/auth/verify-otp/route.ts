import { NextResponse } from "next/server";
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
    const { phone, otp } = await req.json();
    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP required" }, { status: 400 });
    }

    if (!env.supabaseServiceRole) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const qs = `phone=eq.${encodeURIComponent(phone)}&otp=eq.${otp}&verified=eq.false&expires_at=gt.${encodeURIComponent(new Date().toISOString())}`;
    const res = await fetch(`${env.supabaseUrl}/rest/v1/phone_otps?${qs}&order=created_at.desc&limit=1`, {
      headers,
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: "Invalid or expired code", detail: err.message }, { status: 400 });
    }

    const records = await res.json();
    if (!records || records.length === 0) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    await fetch(`${env.supabaseUrl}/rest/v1/phone_otps?id=eq.${records[0].id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ verified: true }),
    });

    const password = crypto.randomUUID().slice(0, 16);
    const email = `${phone.replace(/[^0-9]/g, "")}@app.greenflag`;

    const authHeaders = {
      apikey: env.supabaseServiceRole,
      Authorization: `Bearer ${env.supabaseServiceRole}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // List users to check if exists
    const listRes = await fetch(`${env.supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
      headers: authHeaders,
    });
    const listData = await listRes.json();
    const existing = listData?.users?.[0];

    if (existing) {
      await fetch(`${env.supabaseUrl}/auth/v1/admin/users/${existing.id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ password, email_confirm: true }),
      });
    } else {
      const createRes = await fetch(`${env.supabaseUrl}/auth/v1/admin/users`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ email, password, email_confirm: true }),
      });
      if (!createRes.ok) {
        const createErr = await createRes.json();
        return NextResponse.json({ error: createErr.msg || createErr.message || "Failed to create user" }, { status: 400 });
      }
    }

    return NextResponse.json({ email, password });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Verification failed" }, { status: 500 });
  }
}
