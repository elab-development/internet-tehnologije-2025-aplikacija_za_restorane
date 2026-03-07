import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";

// GET /api/my-restaurants
export async function GET() {
  const guard = await requireRole(["MANAGER", "ADMIN"]);
  if (!guard.ok) return guard.response;

  const restaurants =
    guard.auth.role === "ADMIN"
      ? await prisma.restaurant.findMany({
          select: {
            id: true,
            naziv: true,
          },
          orderBy: { id: "asc" },
        })
      : await prisma.restaurant.findMany({
          where: {
            administratorId: guard.auth.userId,
          },
          select: {
            id: true,
            naziv: true,
          },
          orderBy: { id: "asc" },
        });

  return NextResponse.json(restaurants);
}