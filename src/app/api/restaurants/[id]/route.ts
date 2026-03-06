import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";


function toId(params: { id: string }) {
  const id = Number(params.id);
  return Number.isFinite(id) ? id : null;
}

// GET /api/restaurants/:id
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = toId(params);
  if (!id) return NextResponse.json({ error: "Nevalidan id" }, { status: 400 });

  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: { tables: true, menuItems: true, administrator: true },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Restoran nije pronađen" }, { status: 404 });
  }

  return NextResponse.json(restaurant);
}

// PUT /api/restaurants/:id
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireRole(["MANAGER", "ADMIN"]);
  if (!guard.ok) return guard.response;
  
  const id = toId(params);
  if (!id) return NextResponse.json({ error: "Nevalidan id" }, { status: 400 });

  const body = await req.json();

  try {
    const updated = await prisma.restaurant.update({
      where: { id },
      data: {
        naziv: body.naziv,
        adresa: body.adresa,
        opis: body.opis,
        radnoVreme: body.radnoVreme,
      },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Restoran nije pronađen" }, { status: 404 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/restaurants/:id
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) return guard.response;

  const id = toId(params);
  if (!id) return NextResponse.json({ error: "Nevalidan id" }, { status: 400 });

  try {
    await prisma.restaurant.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Restoran nije pronađen" }, { status: 404 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
