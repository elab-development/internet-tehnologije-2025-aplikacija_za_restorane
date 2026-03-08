import { requireAuth } from "@/lib/guards";
import { NextResponse } from "next/server";

export async function GET() {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  return NextResponse.json({
    id: guard.auth.userId,
    uloga: guard.auth.role,
  });
}