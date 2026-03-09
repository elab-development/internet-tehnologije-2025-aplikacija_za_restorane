import { requireAuth } from "@/lib/guards";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Vraća trenutno prijavljenog korisnika
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Trenutni korisnik
 *       401:
 *         description: Korisnik nije prijavljen
 */
export async function GET() {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  return NextResponse.json({
    id: guard.auth.userId,
    uloga: guard.auth.role,
  });
}