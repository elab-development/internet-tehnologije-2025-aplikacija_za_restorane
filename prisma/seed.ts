import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {

  const adminPass = await bcrypt.hash("123456", 10);
  const managerPass = await bcrypt.hash("123456", 10);
  const guestPass = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.create({
    data: {
      ime: "Admin",
      email: "admin@test.com",
      lozinka: adminPass,
      uloga: "ADMIN",
    },
  });

  const manager = await prisma.user.create({
    data: {
      ime: "Manager",
      email: "manager@test.com",
      lozinka: managerPass,
      uloga: "MANAGER",
    },
  });

  const guest = await prisma.user.create({
    data: {
      ime: "Guest",
      email: "guest@test.com",
      lozinka: guestPass,
      uloga: "GUEST",
    },
  });

  const restaurant = await prisma.restaurant.create({
    data: {
      naziv: "Test restoran 1",
      adresa: "Knez Mihailova 10",
      opis: "Restoran u centru grada",
      radnoVreme: "09:00-23:00",
      administratorId: manager.id,
    },
  });

  await prisma.table.createMany({
    data: [
      {
        restoranId: restaurant.id,
        brojStola: 1,
        kapacitet: 2,
      },
      {
        restoranId: restaurant.id,
        brojStola: 2,
        kapacitet: 4,
      },
      {
        restoranId: restaurant.id,
        brojStola: 3,
        kapacitet: 6,
      },
    ],
  });

  console.log("Seed uspešno ubačen");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });