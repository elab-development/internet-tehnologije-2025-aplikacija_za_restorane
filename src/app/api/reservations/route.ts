import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/guards";

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
  let endMinutes = endHour * 60 + endMinute;

  // ako je kraj 00:00
  if (endMinutes === 0) {
    endMinutes = 24 * 60;
  }

  // standardno npr 08 - 23
  if (startMinutes < endMinutes) {
    return (
      reservationMinutes >= startMinutes &&
      reservationMinutes < endMinutes
    );
  }

  // kada je ponoc npr 20 - 02:00
  return (
    reservationMinutes >= startMinutes ||
    reservationMinutes < endMinutes
  );
}


/**
 * @swagger
 * /api/reservations:
 *   get:
 *     summary: Vraća sve rezervacije
 *     tags:
 *       - Reservations
 *     responses:
 *       200:
 *         description: Lista rezervacija
 */
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

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Kreira novu rezervaciju
 *     tags:
 *       - Reservations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tableId:
 *                 type: integer
 *               dateTime:
 *                 type: string
 *                 format: date-time
 *               brojOsoba:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Rezervacija uspešno kreirana
 */
// POST /api/reservations
// Poenta: kreira novu rezervaciju uz osnovne provere
export async function POST(req: Request) {
  try {
    const guard = await requireAuth();
    if (!guard.ok) return guard.response;

    const body = await req.json();

    if (!body.tableId || !body.dateTime || !body.brojOsoba) {
      return NextResponse.json(
        { error: "Obavezno: tableId, dateTime, brojOsoba" },
        { status: 400 }
      );
    }

    const userId = Number(guard.auth.userId);
    const tableId = Number(body.tableId);
    const brojOsoba = Number(body.brojOsoba);

    if (
      !Number.isFinite(userId) ||
      !Number.isFinite(tableId) ||
      !Number.isFinite(brojOsoba)
    ) {
      return NextResponse.json(
        { error: "tableId i brojOsoba moraju biti brojevi" },
        { status: 400 }
      );
    }

    const dateTime = new Date(body.dateTime);
    if (Number.isNaN(dateTime.getTime())) {
      return NextResponse.json(
        { error: "dateTime nije validan datum" },
        { status: 400 }
      );
    }

    const allowedStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
    const status = body.status ?? "PENDING";

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          error:
            "status mora biti: PENDING, CONFIRMED, CANCELLED ili COMPLETED",
        },
        { status: 400 }
      );
    }

    // Provera da sto postoji + kapacitet + restoran i radno vreme
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        restaurant: {
          select: {
            id: true,
            naziv: true,
            radnoVreme: true,
          },
        },
      },
    });

    if (!table) {
      return NextResponse.json({ error: "Sto ne postoji" }, { status: 404 });
    }

    if (brojOsoba > table.kapacitet) {
      return NextResponse.json(
        { error: "Broj osoba prelazi kapacitet stola" },
        { status: 400 }
      );
    }

    if (!isWithinWorkingHours(dateTime, table.restaurant.radnoVreme)) {
      return NextResponse.json(
        { error: "Rezervacija nije moguća van radnog vremena restorana" },
        { status: 400 }
      );
    }

    // Pravilo: jedna rezervacija traje 2 sata
    const reservationDurationMs = 2 * 60 * 60 * 1000;
    const newStart = dateTime;
    const newEnd = new Date(dateTime.getTime() + reservationDurationMs);

    const existingReservations = await prisma.reservation.findMany({
      where: {
        tableId,
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
    if (e?.code === "P2002") {
      return NextResponse.json(
        { error: "Rezervacija već postoji za ovog korisnika, sto i termin" },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}