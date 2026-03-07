import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";

function toId(idParam: string) {
  const id = Number(idParam);
  return Number.isFinite(id) ? id : null;
}

// GET /api/restaurants/:id
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const id = toId(rawId);

  if (!id) {
    return NextResponse.json({ error: "Nevalidan id" }, { status: 400 });
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: {
      tables: true,
      menuItems: true,
      administrator: {
        select: {
          id: true,
          ime: true,
          email: true,
          uloga: true,
        },
      },
    },
  });

  if (!restaurant) {
    return NextResponse.json(
      { error: "Restoran nije pronađen" },
      { status: 404 }
    );
  }

  return NextResponse.json(restaurant);
}

// PUT /api/restaurants/:id
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole(["MANAGER", "ADMIN"]);
  if (!guard.ok) return guard.response;

  const { id: rawId } = await params;
  const id = toId(rawId);

  if (!id) {
    return NextResponse.json({ error: "Nevalidan id" }, { status: 400 });
  }

  const existing = await prisma.restaurant.findUnique({
    where: { id },
    select: { id: true, administratorId: true },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Restoran nije pronađen" },
      { status: 404 }
    );
  }

  if (
    guard.auth.role === "MANAGER" &&
    existing.administratorId !== guard.auth.userId
  ) {
    return NextResponse.json({ error: "Nemate dozvolu" }, { status: 403 });
  }

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
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/restaurants/:id
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole(["MANAGER", "ADMIN"]);
  if (!guard.ok) return guard.response;

  const { id: rawId } = await params;
  const id = toId(rawId);

  if (!id) {
    return NextResponse.json({ error: "Nevalidan id" }, { status: 400 });
  }

  const existing = await prisma.restaurant.findUnique({
    where: { id },
    select: { id: true, administratorId: true },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Restoran nije pronađen" },
      { status: 404 }
    );
  }

  if (
    guard.auth.role === "MANAGER" &&
    existing.administratorId !== guard.auth.userId
  ) {
    return NextResponse.json({ error: "Nemate dozvolu" }, { status: 403 });
  }

  try {
    await prisma.restaurant.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "Restoran ne može da se obriše jer ima povezane stolove, rezervacije ili meni.",
        },
        { status: 400 }
      );
    }

    if (e?.code === "P2025") {
      return NextResponse.json(
        { error: "Restoran nije pronađen" },
        { status: 404 }
      );
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}