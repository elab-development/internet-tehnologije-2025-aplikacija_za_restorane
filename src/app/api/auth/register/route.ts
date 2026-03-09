import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registracija korisnika
 *     tags:
 *       - Auth
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
 *             properties:
 *               ime:
 *                 type: string
 *                 example: Milica
 *               email:
 *                 type: string
 *                 example: milica@test.com
 *               lozinka:
 *                 type: string
 *                 example: 123456
 *               uloga:
 *                 type: string
 *                 enum: [GUEST, MANAGER]
 *                 example: GUEST
 *     responses:
 *       201:
 *         description: Korisnik uspešno registrovan
 *       400:
 *         description: Nedostaju podaci ili nevalidna uloga
 *       409:
 *         description: Email već postoji
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.ime || !body.email || !body.lozinka) {
      return NextResponse.json(
        { error: "Obavezno: ime, email, lozinka" },
        { status: 400 }
      );
    }

    const allowedRoles = ["GUEST", "MANAGER"];
    const uloga =
      body.uloga && allowedRoles.includes(body.uloga)
        ? body.uloga
        : "GUEST";

    const hashed = await bcrypt.hash(String(body.lozinka), 10);

    const user = await prisma.user.create({
      data: {
        ime: String(body.ime),
        email: String(body.email),
        lozinka: hashed,
        uloga,
      },
      select: {
        id: true,
        ime: true,
        email: true,
        uloga: true,
        datumKreiranja: true,
      },
    });

    const token = signToken({ userId: user.id, role: user.uloga });

    const res = NextResponse.json(user, { status: 201 });

    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json(
        { error: "Email već postoji" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}