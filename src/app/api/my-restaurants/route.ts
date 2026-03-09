import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";

/**
 * @swagger
 * /api/my-restaurants:
 *   get:
 *     summary: Vraća restorane koje poseduje ulogovani menadžer
 *     tags:
 *       - Manager
 *     responses:
 *       200:
 *         description: Lista restorana menadžera
 *       401:
 *         description: Korisnik nije prijavljen
 *       403:
 *         description: Samo menadžer ili admin
 */
// GET /api/my-restaurants
export async function GET() {
  const guard = await requireRole(["MANAGER", "ADMIN"]);
  if (!guard.ok) return guard.response;

  const restaurants =
    guard.auth.role === "ADMIN"
      ? await prisma.restaurant.findMany({
          select: {
            id: true,
            naziv: true,
            adresa: true,
            opis: true,
            radnoVreme: true,
            administratorId: true,
          },
          orderBy: { id: "asc" },
        })
      : await prisma.restaurant.findMany({
          where: {
            administratorId: guard.auth.userId,
          },
          select: {
            id: true,
            naziv: true,
            adresa: true,
            opis: true,
            radnoVreme: true,
            administratorId: true,
          },
          orderBy: { id: "asc" },
        });

  return NextResponse.json(restaurants);
}