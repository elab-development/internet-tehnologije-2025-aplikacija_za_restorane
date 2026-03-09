import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";

/**
 * @swagger
 * /api/tables:
 *   get:
 *     summary: Vraća sve stolove
 *     tags:
 *       - Tables
 *     responses:
 *       200:
 *         description: Lista stolova
 */
// GET /api/tables
// Poenta: vraća sve stolove sa informacijom kom restoranu pripadaju
export async function GET() {
  const tables = await prisma.table.findMany({
    include: {
      restaurant: {
        select: {
          id: true,
          naziv: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(tables);
}

/**
 * @swagger
 * /api/tables:
 *   post:
 *     summary: Kreira novi sto
 *     tags:
 *       - Tables
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restoranId
 *               - brojStola
 *               - kapacitet
 *             properties:
 *               restoranId:
 *                 type: integer
 *                 example: 1
 *               brojStola:
 *                 type: integer
 *                 example: 5
 *               kapacitet:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       201:
 *         description: Sto uspešno dodat
 *       409:
 *         description: Sto već postoji
 */
// POST /api/tables
// Poenta: dodaje novi sto u restoran
export async function POST(req: Request) {
  try {
    const guard = await requireRole(["MANAGER", "ADMIN"]);
    if (!guard.ok) return guard.response;

    const body = await req.json();

    if (!body.restoranId || !body.brojStola || !body.kapacitet) {
      return NextResponse.json(
        { error: "Obavezno: restoranId, brojStola, kapacitet" },
        { status: 400 }
      );
    }

    const restoranId = Number(body.restoranId);
    const brojStola = Number(body.brojStola);
    const kapacitet = Number(body.kapacitet);

    if (
      !Number.isFinite(restoranId) ||
      !Number.isFinite(brojStola) ||
      !Number.isFinite(kapacitet)
    ) {
      return NextResponse.json(
        { error: "restoranId, brojStola i kapacitet moraju biti brojevi" },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restoranId },
      select: { id: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restoran ne postoji" },
        { status: 404 }
      );
    }

    const table = await prisma.table.create({
      data: {
        restoranId,
        brojStola,
        kapacitet,
      },
    });

    return NextResponse.json(table, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json(
        { error: "Sto sa tim brojem već postoji u tom restoranu."},
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}