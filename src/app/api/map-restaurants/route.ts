import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";

/**
 * @swagger
 * /api/map-restaurants:
 *   get:
 *     summary: Vraća restorane za prikaz na mapi
 *     tags:
 *       - Map
 *     responses:
 *       200:
 *         description: Lista restorana sa koordinatama
 */
// GET /api/map-restaurants
// - manager vidi samo svoje restorane
// - guest / neprijavljen / admin vidi sve
export async function GET() {
  const auth = await getAuth();

  let restaurants;

  if (auth?.role === "MANAGER") {
    restaurants = await prisma.restaurant.findMany({
      where: {
        administratorId: auth.userId,
      },
      select: {
        id: true,
        naziv: true,
        adresa: true,
      },
      orderBy: { id: "asc" },
    });
  } else {
    restaurants = await prisma.restaurant.findMany({
      select: {
        id: true,
        naziv: true,
        adresa: true,
      },
      orderBy: { id: "asc" },
    });
  }

  return NextResponse.json(restaurants);
}