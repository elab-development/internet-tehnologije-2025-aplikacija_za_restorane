import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/guards";

function parseId(idParam: string) {
  const id = Number(idParam);
  return Number.isFinite(id) ? id : null;
}

function isWithinWorkingHours(dateTime: Date, radnoVreme: string) {
  const [start, end] = radnoVreme.split("-");

  if (!start || !end) return false;

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  if (
    [startHour, startMinute, endHour, endMinute].some((value) =>
      Number.isNaN(value)
    )
  ) {
    return false;
  }

  const reservationMinutes = dateTime.getHours() * 60 + dateTime.getMinutes();
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  return reservationMinutes >= startMinutes && reservationMinutes < endMinutes;
}

// GET /api/reservations/:id
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json({ error: "Nevalidan id" }, { status: 400 });
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, ime: true, email: true, uloga: true } },
      table: {
        include: {
          restaurant: {
            select: {
              id: true,
              naziv: true,
              adresa: true,
              radnoVreme: true,
            },
          },
        },
      },
      order: true,
    },
  });

  if (!reservation) {
    return NextResponse.json(
      { error: "Rezervacija nije pronađena" },
      { status: 404 }
    );
  }

  return NextResponse.json(reservation);
}

// PUT /api/reservations/:id
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json({ error: "Nevalidan id" }, { status: 400 });
  }

  const body = await req.json();

  const existingReservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      table: {
        include: {
          restaurant: {
            select: {
              id: true,
              radnoVreme: true,
            },
          },
        },
      },
    },
  });

  if (!existingReservation) {
    return NextResponse.json(
      { error: "Rezervacija nije pronađena" },
      { status: 404 }
    );
  }

  const data: { status?: string; brojOsoba?: number; dateTime?: Date } = {};

  if (body.status !== undefined) {
    const allowedStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          error:
            "status mora biti: PENDING, CONFIRMED, CANCELLED ili COMPLETED",
        },
        { status: 400 }
      );
    }

    data.status = body.status;
  }

  if (body.brojOsoba !== undefined) {
    const brojOsoba = Number(body.brojOsoba);

    if (!Number.isFinite(brojOsoba)) {
      return NextResponse.json(
        { error: "brojOsoba mora biti broj" },
        { status: 400 }
      );
    }

    if (brojOsoba > existingReservation.table.kapacitet) {
      return NextResponse.json(
        { error: "Broj osoba prelazi kapacitet stola" },
        { status: 400 }
      );
    }

    data.brojOsoba = brojOsoba;
  }

  let newDateTime: Date | null = null;

  if (body.dateTime !== undefined) {
    const dt = new Date(body.dateTime);

    if (Number.isNaN(dt.getTime())) {
      return NextResponse.json(
        { error: "dateTime nije validan datum" },
        { status: 400 }
      );
    }

    if (
      !isWithinWorkingHours(dt, existingReservation.table.restaurant.radnoVreme)
    ) {
      return NextResponse.json(
        { error: "Rezervacija nije moguća van radnog vremena restorana" },
        { status: 400 }
      );
    }

    newDateTime = dt;
    data.dateTime = dt;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Nema podataka za izmenu" },
      { status: 400 }
    );
  }

  if (newDateTime) {
    const reservationDurationMs = 2 * 60 * 60 * 1000;
    const newStart = newDateTime;
    const newEnd = new Date(newDateTime.getTime() + reservationDurationMs);

    const existingReservations = await prisma.reservation.findMany({
      where: {
        tableId: existingReservation.tableId,
        id: { not: id },
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    const hasOverlap = existingReservations.some((reservation) => {
      const existingStart = new Date(reservation.dateTime);
      const existingEnd = new Date(
        existingStart.getTime() + reservationDurationMs
      );

      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasOverlap) {
      return NextResponse.json(
        { error: "Izabrani sto je već rezervisan u tom terminu" },
        { status: 409 }
      );
    }
  }

  try {
    const updated = await prisma.reservation.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("PUT reservation error:", e);

    if (e?.code === "P2025") {
      return NextResponse.json(
        { error: "Rezervacija nije pronađena" },
        { status: 404 }
      );
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
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAuth();
  if (!guard.ok) return guard.response;

  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json({ error: "Nevalidan id" }, { status: 400 });
  }

  try {
    await prisma.reservation.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE reservation error:", e);

    if (e?.code === "P2025") {
      return NextResponse.json(
        { error: "Rezervacija nije pronađena" },
        { status: 404 }
      );
    }

    if (e?.code === "P2003") {
      return NextResponse.json(
        { error: "Rezervacija ne može da se obriše jer ima povezane podatke." },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}