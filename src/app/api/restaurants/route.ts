import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";

/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Vraća sve restorane
 *     tags:
 *       - Restaurants
 *     responses:
 *       200:
 *         description: Lista restorana
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Restaurant'
 */
// GET /api/restaurants
export async function GET() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { id: "asc" },
  });

  return NextResponse.json(restaurants);
}

/**
 * @swagger
 * /api/restaurants:
 *   post:
 *     summary: Kreira novi restoran
 *     tags:
 *       - Restaurants
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               naziv:
 *                 type: string
 *               adresa:
 *                 type: string
 *               opis:
 *                 type: string
 *               radnoVreme:
 *                 type: string
 *               administratorId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Restoran je uspešno kreiran
 */
// POST /api/restaurants
export async function POST(req: Request) {
  try {
    const guard = await requireRole(["MANAGER", "ADMIN"]);
    if (!guard.ok) return guard.response;

    const body = await req.json();

    if (!body.naziv || !body.adresa || !body.radnoVreme) {
      return NextResponse.json(
        { error: "Obavezno: naziv, adresa, radnoVreme" },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        naziv: body.naziv,
        adresa: body.adresa,
        opis: body.opis ?? null,
        radnoVreme: body.radnoVreme,
        administratorId: guard.auth.userId,
      },
    });

    return NextResponse.json(restaurant, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}