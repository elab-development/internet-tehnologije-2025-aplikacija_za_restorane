import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/guards";


function parseId(params: { id: string }) {
  const id = Number(params.id);
  return Number.isFinite(id) ? id : null;
}

// GET /api/reservations/:id
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;
  
  const id = parseId(params);
  if (!id) return NextResponse.json({ error: "Nevalidan id" }, { status: 400 });

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, ime: true, email: true, uloga: true } },
      table: { include: { restaurant: true } },
      order: true,
    },
  });

  if (!reservation) {
    return NextResponse.json({ error: "Rezervacija nije pronađena" }, { status: 404 });
  }

  return NextResponse.json(reservation);
}

// PUT /api/reservations/:id
// MVP: dozvoljavamo izmenu statusa i broja osoba
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  
  const id = parseId(params);
  if (!id) return NextResponse.json({ error: "Nevalidan id" }, { status: 400 });

  const body = await req.json();

  const data: { status?: string; brojOsoba?: number; dateTime?: Date } = {};

  if (body.status !== undefined) {
    const allowedStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "status mora biti: PENDING, CONFIRMED, CANCELLED ili COMPLETED" },
        { status: 400 }
      );
    }
    data.status = body.status;
  }

  if (body.brojOsoba !== undefined) {
    const brojOsoba = Number(body.brojOsoba);
    if (!Number.isFinite(brojOsoba)) {
      return NextResponse.json({ error: "brojOsoba mora biti broj" }, { status: 400 });
    }
    data.brojOsoba = brojOsoba;
  }

  if (body.dateTime !== undefined) {
    const dt = new Date(body.dateTime);
    if (Number.isNaN(dt.getTime())) {
      return NextResponse.json({ error: "dateTime nije validan datum" }, { status: 400 });
    }
    data.dateTime = dt;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nema podataka za izmenu" }, { status: 400 });
  }

  try {
    // Ako menjamo brojOsoba, proveri kapacitet stola
    if (data.brojOsoba !== undefined) {
      const existing = await prisma.reservation.findUnique({
        where: { id },
        select: { tableId: true },
      });

      if (!existing) {
        return NextResponse.json({ error: "Rezervacija nije pronađena" }, { status: 404 });
      }

      const table = await prisma.table.findUnique({
        where: { id: existing.tableId },
        select: { kapacitet: true },
      });

      if (table && data.brojOsoba > table.kapacitet) {
        return NextResponse.json(
          { error: "Broj osoba prelazi kapacitet stola" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Rezervacija nije pronađena" }, { status: 404 });
    }
    if (e?.code === "P2002") {
      return NextResponse.json(
        { error: "Duplikat: user + table + dateTime već postoji" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/reservations/:id
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  
  const id = parseId(params);
  if (!id) return NextResponse.json({ error: "Nevalidan id" }, { status: 400 });

  try {
    await prisma.reservation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Rezervacija nije pronađena" }, { status: 404 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
