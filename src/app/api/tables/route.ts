import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";

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