import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ exists: false });

    const serviceRole = env.supabaseServiceRole;
    if (!serviceRole) {
      return NextResponse.json({ exists: false, error: "Server not configured" });
    }

    const baseHeaders = {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Profile": "public",
      "Content-Profile": "public",
    };

    const res = await fetch(
      `${env.supabaseUrl}/rest/v1/profiles?phone=eq.${encodeURIComponent(phone)}&select=id`,
      { headers: baseHeaders }
    );
    const profiles = await res.json();
    if (profiles && profiles.length > 0) return NextResponse.json({ exists: true });

    const authHeaders = {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const listRes = await fetch(`${env.supabaseUrl}/auth/v1/admin/users`, { headers: authHeaders });
    const listData = await listRes.json();
    const exists = listData?.users?.some((u: any) => u.phone === phone) ?? false;
    return NextResponse.json({ exists });
  } catch {
    return NextResponse.json({ exists: false, error: "Server error" }, { status: 500 });
  }
}
