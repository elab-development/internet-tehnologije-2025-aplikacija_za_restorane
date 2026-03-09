import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";
import bcrypt from "bcryptjs";


/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Vraća sve korisnike
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Lista korisnika
 *       403:
 *         description: Samo admin
 */
// GET /api/users
// Poenta: vraća sve korisnike (bez lozinke)
export async function GET() {
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) return guard.response;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      ime: true,
      email: true,
      uloga: true,
      datumKreiranja: true,
    },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(users);
}

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Kreira novog korisnika
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ime
 *               - email
 *               - lozinka
 *               - uloga
 *             properties:
 *               ime:
 *                 type: string
 *               email:
 *                 type: string
 *               lozinka:
 *                 type: string
 *               uloga:
 *                 type: string
 *                 enum: [GUEST, MANAGER, ADMIN]
 *     responses:
 *       201:
 *         description: Korisnik uspešno kreiran
 *       409:
 *         description: Email već postoji
 */
// POST /api/users
// Poenta: admin kreira novog korisnika u bazi
export async function POST(req: Request) {
  try {
    const guard = await requireRole(["ADMIN"]);
    if (!guard.ok) return guard.response;

    const body = await req.json();

    if (!body.ime || !body.email || !body.lozinka || !body.uloga) {
      return NextResponse.json(
        { error: "Obavezno: ime, email, lozinka, uloga" },
        { status: 400 }
      );
    }

    const allowedRoles = ["GUEST", "MANAGER", "ADMIN"];
    if (!allowedRoles.includes(body.uloga)) {
      return NextResponse.json(
        { error: "Uloga mora biti: GUEST, MANAGER ili ADMIN" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(String(body.lozinka), 10);

    const user = await prisma.user.create({
      data: {
        ime: body.ime,
        email: body.email,
        lozinka: hashedPassword,
        uloga: body.uloga,
      },
      select: {
        id: true,
        ime: true,
        email: true,
        uloga: true,
        datumKreiranja: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Email već postoji" }, { status: 409 });
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}