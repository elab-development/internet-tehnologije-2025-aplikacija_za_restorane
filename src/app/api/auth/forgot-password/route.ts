import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, novaLozinka } = body;

    if (!email || !novaLozinka) {
      return NextResponse.json(
        { error: "Email i nova lozinka su obavezni." },
        { status: 400 }
      );
    }

    const korisnik = await prisma.user.findUnique({
      where: { email },
    });

    if (!korisnik) {
      return NextResponse.json(
        { error: "Korisnik sa tim emailom ne postoji." },
        { status: 404 }
      );
    }

    const hashovanaLozinka = await bcrypt.hash(novaLozinka, 10);

    await prisma.user.update({
      where: { email },
      data: {
        lozinka: hashovanaLozinka,
      },
    });

    return NextResponse.json({
      message: "Lozinka je uspešno promenjena.",
    });
  } catch {
    return NextResponse.json(
      { error: "Greška na serveru." },
      { status: 500 }
    );
  }
}