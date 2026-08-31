import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed start...");

  const adminPass = await bcrypt.hash("123456", 10);
  const managerPass = await bcrypt.hash("123456", 10);
  const guestPass = await bcrypt.hash("123456", 10);


  await prisma.reservation.deleteMany();
  await prisma.table.deleteMany();
  await prisma.restaurant.deleteMany();
  //await prisma.user.deleteMany();

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

  await prisma.user.create({
    data: {
      ime: "Guest",
      email: "guest@test.com",
      lozinka: guestPass,
      uloga: "GUEST",
    },
  });

  const restaurant1 = await prisma.restaurant.create({
    data: {
      naziv: "Novi",
      adresa: "Knez Mihailova 10, Beograd, Srbija",
      opis: "Italijanska hrana",
      radnoVreme: "09:00-23:00",
      administratorId: manager.id,
    },
  });

  const restaurant2 = await prisma.restaurant.create({
    data: {
      naziv: "Brza hrana",
      adresa: "Bulevar kralja Aleksandra 73, Beograd, Srbija",
      opis: "fast food",
      radnoVreme: "08:00-00:00",
      administratorId: manager.id,
    },
  });

  await prisma.table.createMany({
    data: [
      {
        restoranId: restaurant1.id,
        brojStola: 1,
        kapacitet: 2,
      },
      {
        restoranId: restaurant1.id,
        brojStola: 2,
        kapacitet: 4,
      },
      {
        restoranId: restaurant2.id,
        brojStola: 1,
        kapacitet: 2,
      },
      {
        restoranId: restaurant2.id,
        brojStola: 2,
        kapacitet: 4,
      },
    ],
  });

  console.log("Seed uspešno ubačen");
}

main()
  .catch((e) => {
    console.error("GRESKA U SEED-U:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Konekcija zatvorena.");
  });