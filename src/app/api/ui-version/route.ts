import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    version: "savee-v2",
    components: ["SaveeCard", "SaveeGrid"],
    commit: process.env.VERCEL_GIT_COMMIT_SHA || "local-dev"
  });
}
