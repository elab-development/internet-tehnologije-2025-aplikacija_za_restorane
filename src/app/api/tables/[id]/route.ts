import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";

function parseId(idParam: string) {
  const id = Number(idParam);
  return Number.isFinite(id) ? id : null;
}

// GET /api/tables/:id
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json({ error: "Nevalidan id" }, { status: 400 });
  }

  const table = await prisma.table.findUnique({
    where: { id },
    include: {
      restaurant: {
        select: { id: true, naziv: true },
      },
    },
  });

  if (!table) {
    return NextResponse.json({ error: "Sto nije pronađen" }, { status: 404 });
  }

  return NextResponse.json(table);
}

// PUT /api/tables/:id
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole(["MANAGER", "ADMIN"]);
  if (!guard.ok) return guard.response;

  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json({ error: "Nevalidan id" }, { status: 400 });
  }

  const body = await req.json();

  const data: { brojStola?: number; kapacitet?: number } = {};

  if (body.brojStola !== undefined) {
    const brojStola = Number(body.brojStola);
    if (!Number.isFinite(brojStola)) {
      return NextResponse.json(
        { error: "brojStola mora biti broj" },
        { status: 400 }
      );
    }
    data.brojStola = brojStola;
  }

  if (body.kapacitet !== undefined) {
    const kapacitet = Number(body.kapacitet);
    if (!Number.isFinite(kapacitet)) {
      return NextResponse.json(
        { error: "kapacitet mora biti broj" },
        { status: 400 }
      );
    }
    data.kapacitet = kapacitet;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "Nema podataka za izmenu" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.table.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Sto nije pronađen" }, { status: 404 });
    }
    if (e?.code === "P2002") {
      return NextResponse.json(
        { error: "Sto sa tim brojem već postoji u tom restoranu" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/tables/:id
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) return guard.response;

  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json({ error: "Nevalidan id" }, { status: 400 });
  }

  try {
    await prisma.table.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Sto nije pronađen" }, { status: 404 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}