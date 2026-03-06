import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/guards";


// GET /api/reservations
// Poenta: vraća rezervacije + povezane podatke (user, sto, restoran)
export async function GET() {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  const reservations = await prisma.reservation.findMany({
    include: {
      user: {
        select: { id: true, ime: true, email: true, uloga: true },
      },
      table: {
        include: {
          restaurant: { select: { id: true, naziv: true, adresa: true } },
        },
      },
      order: true,
    },
    orderBy: { dateTime: "desc" },
  });

  return NextResponse.json(reservations);
}

// POST /api/reservations
// Poenta: kreira novu rezervaciju uz osnovne provere
export async function POST(req: Request) {
  try {
    const guard = await requireAuth();
    if (!guard.ok) return guard.response;

    const body = await req.json();

    // obavezna polja
    if (!body.tableId || !body.dateTime || !body.brojOsoba) {
      return NextResponse.json(
        { error: "Obavezno: tableId, dateTime, brojOsoba" },
        { status: 400 }
      );
    }

    const userId = Number(guard.auth.userId);
    const tableId = Number(body.tableId);
    const brojOsoba = Number(body.brojOsoba);

   if (!Number.isFinite(userId) || !Number.isFinite(tableId) || !Number.isFinite(brojOsoba)) {
      return NextResponse.json(
        { error: "tableId i brojOsoba moraju biti brojevi" },
        { status: 400 }
      );
  }

    // parsiranje datuma
    const dateTime = new Date(body.dateTime);
    if (Number.isNaN(dateTime.getTime())) {
      return NextResponse.json({ error: "dateTime nije validan datum" }, { status: 400 });
    }

    // status (MVP: string, ali mi ga ograničimo na poznate vrednosti)
    const allowedStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
    const status = body.status ?? "PENDING";
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "status mora biti: PENDING, CONFIRMED, CANCELLED ili COMPLETED" },
        { status: 400 }
      );
    }

    // provera da sto postoji + kapacitet
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      select: { kapacitet: true },
    });

    if (!table) return NextResponse.json({ error: "Sto ne postoji" }, { status: 404 });

    if (brojOsoba > table.kapacitet) {
      return NextResponse.json(
        { error: "Broj osoba prelazi kapacitet stola" },
        { status: 400 }
      );
    }

    // kreiranje rezervacije (unique constraint u bazi hvata duplikate)
    const reservation = await prisma.reservation.create({
      data: {
        userId,
        tableId,
        dateTime,
        brojOsoba,
        status,
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (e: any) {
    // P2002 = unique constraint (kod tebe: @@unique([userId, tableId, dateTime]))
    if (e?.code === "P2002") {
      return NextResponse.json(
        { error: "Rezervacija već postoji za ovog korisnika, sto i termin" },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
