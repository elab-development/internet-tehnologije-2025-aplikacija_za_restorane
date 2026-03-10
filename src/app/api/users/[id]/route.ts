import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Brisanje korisnika
 *     description: Administrator može obrisati korisnika po ID-u. Admin ne može obrisati sebe niti drugog admina.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID korisnika koji se briše
 *         schema:
 *           type: integer
 *           example: 4
 *     responses:
 *       200:
 *         description: Korisnik uspešno obrisan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Nevalidan ID ili admin pokušava da obriše sebe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     invalidId:
 *                       value: Nevalidan id
 *                     deleteSelf:
 *                       value: Admin ne može da obriše sopstveni nalog.
 *                     relatedData:
 *                       value: Korisnik ne može da se obriše jer ima povezane podatke.
 *       403:
 *         description: Nije dozvoljeno brisanje drugog admina
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Admin ne može da obriše drugog admina.
 *       404:
 *         description: Korisnik nije pronađen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Korisnik nije pronađen
 *       500:
 *         description: Greška na serveru
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireRole(["ADMIN"]);
  if (!guard.ok) return guard.response;

  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Nevalidan id" }, { status: 400 });
  }

  if (guard.auth.userId === id) {
    return NextResponse.json(
      { error: "Admin ne može da obriše sopstveni nalog." },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      uloga: true,
    },
  });

  if (!existingUser) {
    return NextResponse.json(
      { error: "Korisnik nije pronađen" },
      { status: 404 }
    );
  }

  if (existingUser.uloga === "ADMIN") {
    return NextResponse.json(
      { error: "Admin ne može da obriše drugog admina." },
      { status: 403 }
    );
  }

  try {
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE user error:", e);

    if (e?.code === "P2003") {
      return NextResponse.json(
        { error: "Korisnik ne može da se obriše jer ima povezane podatke." },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}