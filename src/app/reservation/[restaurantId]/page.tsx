"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { restaurants } from "@/lib/restaurants";

export default function ReservationPage() {
  const params = useParams();
  const router = useRouter();

  const restaurantId = Number(params.restaurantId);
  const restaurant = restaurants.find((r) => r.id === restaurantId);

  const [guestName, setGuestName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [persons, setPersons] = useState(2);
  const [preference, setPreference] = useState("Sve");
  const [message, setMessage] = useState("");

  const availableTables = useMemo(() => {
    if (persons <= 2) return 6;
    if (persons <= 4) return 4;
    return 2;
  }, [persons]);

  const recommendedMenu = useMemo(() => {
    if (!restaurant) return [];

    if (preference === "Sve") return restaurant.menu;

    return restaurant.menu.filter((item) =>
      item.tags.includes(preference.toLowerCase())
    );
  }, [restaurant, preference]);

  useEffect(() => {
    setMessage("");
  }, [guestName, date, time, persons, preference]);

  if (!restaurant) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold">Restoran nije pronađen</h1>
      </main>
    );
  }

  const handleReservation = () => {
    if (!guestName || !date || !time || persons < 1) {
      setMessage("Popuni sva polja pravilno.");
      return;
    }

    const reservationData = {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      guestName,
      date,
      time,
      persons,
      preference,
    };

    const existingReservations = JSON.parse(
      localStorage.getItem("reservations") || "[]"
    );

    existingReservations.push(reservationData);
    localStorage.setItem("reservations", JSON.stringify(existingReservations));

    setMessage("Rezervacija je uspešno sačuvana.");
    setTimeout(() => {
      router.push("/");
    }, 1500);
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <button
        onClick={() => router.back()}
        className="mb-6 border px-4 py-2 rounded-xl"
      >
        Nazad
      </button>

      <h1 className="text-4xl font-bold mb-2">Rezervacija - {restaurant.name}</h1>
      <p className="text-gray-600 mb-8">
        Popuni podatke za rezervaciju i izaberi preferencije.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="border rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Forma za rezervaciju</h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Ime i prezime"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />

            <input
              type="number"
              min={1}
              value={persons}
              onChange={(e) => setPersons(Number(e.target.value))}
              className="w-full border rounded-xl px-4 py-3"
            />

            <select
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            >
              <option value="Sve">Sve</option>
              <option value="Vegetarijansko">Vegetarijansko</option>
              <option value="Vegansko">Vegansko</option>
              <option value="Bez glutena">Bez glutena</option>
            </select>

            <p className="text-sm text-gray-600">
              Dostupnih stolova za izabrani broj osoba:{" "}
              <span className="font-semibold">{availableTables}</span>
            </p>

            <button
              onClick={handleReservation}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition"
            >
              Potvrdi rezervaciju
            </button>

            {message && (
              <p className="text-sm font-medium text-green-700">{message}</p>
            )}
          </div>
        </div>

        <div className="border rounded-2xl p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Preporučena jela</h2>

          {recommendedMenu.length > 0 ? (
            <div className="space-y-4">
              {recommendedMenu.map((item) => (
                <div key={item.id} className="border rounded-xl p-4">
                  <p className="font-semibold">{item.name}</p>
                  <p>{item.price} RSD</p>
                  <p className="text-sm text-gray-500">{item.tags.join(", ")}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>Nema jela za izabranu preferenciju.</p>
          )}
        </div>
      </div>
    </main>
  );
}