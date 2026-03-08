import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";

function parseId(idParam: string) {
  const id = Number(idParam);
  return Number.isFinite(id) ? id : null;
}

// GET /api/users/:id
export async function GET(
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

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      ime: true,
      email: true,
      uloga: true,
      datumKreiranja: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User nije pronađen" }, { status: 404 });
  }

  return NextResponse.json(user);
}

// PUT /api/users/:id
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) return guard.response;

  const { id: rawId } = await params;
  const id = parseId(rawId);

  if (!id) {
    return NextResponse.json({ error: "Nevalidan id" }, { status: 400 });
  }

  const body = await req.json();

  const data: { ime?: string; email?: string; uloga?: "GUEST" | "MANAGER" | "ADMIN" } = {};

  if (body.ime !== undefined) data.ime = body.ime;
  if (body.email !== undefined) data.email = body.email;

  if (body.uloga !== undefined) {
    const allowedRoles = ["GUEST", "MANAGER", "ADMIN"];
    if (!allowedRoles.includes(body.uloga)) {
      return NextResponse.json(
        { error: "Uloga mora biti: GUEST, MANAGER ili ADMIN" },
        { status: 400 }
      );
    }
    data.uloga = body.uloga;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nema podataka za izmenu" }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        ime: true,
        email: true,
        uloga: true,
        datumKreiranja: true,
      },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "User nije pronađen" }, { status: 404 });
    }
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Email već postoji" }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/users/:id
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
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "User nije pronađen" }, { status: 404 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}