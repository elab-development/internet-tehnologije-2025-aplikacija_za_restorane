import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/guards";

/**
 * @swagger
 * /api/my-reservations:
 *   get:
 *     summary: Vraća rezervacije trenutno prijavljenog korisnika
 *     tags:
 *       - Reservations
 *     responses:
 *       200:
 *         description: Lista rezervacija korisnika
 *       401:
 *         description: Korisnik nije prijavljen
 */
// GET /api/my-reservations
// vraća samo rezervacije prijavljenog korisnika
export async function GET() {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  const reservations = await prisma.reservation.findMany({
    where: {
      userId: guard.auth.userId,
    },
    include: {
      table: {
        include: {
          restaurant: {
            select: {
              id: true,
              naziv: true,
              adresa: true,
            },
          },
        },
      },
    },
    orderBy: {
      dateTime: "desc",
    },
  });

  return NextResponse.json(reservations);
}