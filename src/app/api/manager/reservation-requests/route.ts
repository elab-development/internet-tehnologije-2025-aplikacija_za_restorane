import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";

/**
 * @swagger
 * /api/manager/reservation-requests:
 *   get:
 *     summary: Vraća zahteve za rezervacije za restorane menadžera
 *     tags:
 *       - Manager
 *     responses:
 *       200:
 *         description: Lista zahteva za rezervaciju
 *       401:
 *         description: Korisnik nije prijavljen
 *       403:
 *         description: Samo menadžer ili admin
 */
// GET /api/manager/reservation-requests
export async function GET() {
  const guard = await requireRole(["MANAGER", "ADMIN"]);
  if (!guard.ok) return guard.response;

  const reservations =
    guard.auth.role === "ADMIN"
      ? await prisma.reservation.findMany({
          where: {
            status: "PENDING",
          },
          include: {
            user: {
              select: { id: true, ime: true, email: true },
            },
            table: {
              include: {
                restaurant: {
                  select: { id: true, naziv: true, adresa: true, administratorId: true },
                },
              },
            },
          },
          orderBy: { dateTime: "asc" },
        })
      : await prisma.reservation.findMany({
          where: {
            status: "PENDING",
            table: {
              restaurant: {
                administratorId: guard.auth.userId,
              },
            },
          },
          include: {
            user: {
              select: { id: true, ime: true, email: true },
            },
            table: {
              include: {
                restaurant: {
                  select: { id: true, naziv: true, adresa: true, administratorId: true },
                },
              },
            },
          },
          orderBy: { dateTime: "asc" },
        });

  return NextResponse.json(reservations);
}