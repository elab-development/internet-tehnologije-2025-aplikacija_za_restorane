import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";

function parseId(idParam: string) {
  const id = Number(idParam);
  return Number.isFinite(id) ? id : null;
}

// PATCH /api/manager/reservation-requests/:id
export async function PATCH(
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

  if (!body.status || !["CONFIRMED", "CANCELLED"].includes(body.status)) {
    return NextResponse.json(
      { error: "Status mora biti CONFIRMED ili CANCELLED" },
      { status: 400 }
    );
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: {
      table: {
        include: {
          restaurant: {
            select: { administratorId: true },
          },
        },
      },
    },
  });

  if (!reservation) {
    return NextResponse.json(
      { error: "Rezervacija nije pronađena" },
      { status: 404 }
    );
  }

  if (
    guard.auth.role === "MANAGER" &&
    reservation.table.restaurant.administratorId !== guard.auth.userId
  ) {
    return NextResponse.json({ error: "Nemate dozvolu" }, { status: 403 });
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: {
      status: body.status,
    },
  });

  return NextResponse.json(updated);
}