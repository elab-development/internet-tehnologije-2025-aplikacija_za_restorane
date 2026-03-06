import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";

// GET /api/restaurants
export async function GET() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { id: "asc" },
  });

  return NextResponse.json(restaurants);
}

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