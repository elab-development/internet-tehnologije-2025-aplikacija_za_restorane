"use client";

import { useEffect, useState } from "react";

type Reservation = {
  id: number;
  dateTime: string;
  brojOsoba: number;
  status: string;
  table: {
    id: number;
    brojStola: number;
    kapacitet: number;
    restaurant: {
      id: number;
      naziv: string;
      adresa: string;
    };
  };
};

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [greska, setGreska] = useState("");

  useEffect(() => {
    async function loadReservations() {
      try {
        setLoading(true);
        setGreska("");

        const res = await fetch("/api/my-reservations", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          setGreska(data.error || "Greška pri učitavanju rezervacija");
          return;
        }

        setReservations(data);
      } catch {
        setGreska("Greška na serveru");
      } finally {
        setLoading(false);
      }
    }

    loadReservations();
  }, []);

  async function handleCancelReservation(id: number) {
    try {
      setGreska("");

      const res = await fetch(`/api/reservations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: "CANCELLED",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGreska(data.error || "Greška pri otkazivanju rezervacije");
        return;
      }

      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === id
            ? { ...reservation, status: "CANCELLED" }
            : reservation
        )
      );
    } catch {
      setGreska("Greška na serveru");
    }
  }

  function formatDate(dateString: string) {
  const date = new Date(dateString);

  const datum = date.toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const vreme = date.toLocaleTimeString("sr-RS", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${datum} u ${vreme}`;
}

  function formatStatus(status: string) {
    if (status === "PENDING") return "Na čekanju";
    if (status === "CONFIRMED") return "Potvrđena";
    if (status === "CANCELLED") return "Otkazana";
    if (status === "COMPLETED") return "Završena";
    return status;
  }

  function statusClasses(status: string) {
    if (status === "PENDING") {
      return "bg-amber-50 text-amber-700 border border-amber-200";
    }
    if (status === "CONFIRMED") {
      return "bg-green-50 text-green-700 border border-green-200";
    }
    if (status === "CANCELLED") {
      return "bg-red-50 text-red-700 border border-red-200";
    }
    return "bg-zinc-100 text-zinc-700 border border-zinc-200";
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-zinc-900">Moje rezervacije</h1>

        <p className="text-zinc-600 mt-3 mb-8 text-lg">
          Ovde možete videti sve vaše rezervacije.
        </p>

        {loading && <p className="text-zinc-600">Učitavanje rezervacija...</p>}

        {greska && <p className="text-red-600">{greska}</p>}

        {!loading && !greska && reservations.length === 0 && (
          <p className="text-zinc-600">Trenutno nemate nijednu rezervaciju.</p>
        )}

        {!loading && !greska && reservations.length > 0 && (
          <div className="space-y-5">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-7"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-zinc-900">
                      {reservation.table.restaurant.naziv}
                    </h2>

                    <p className="text-zinc-600 mt-2 text-lg">
                      {reservation.table.restaurant.adresa}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold ${statusClasses(
                      reservation.status
                    )}`}
                  >
                    {formatStatus(reservation.status)}
                  </span>
                </div>

                <div className="mt-6 grid gap-3 text-zinc-800">
                  <p>
                    <span className="font-semibold">Sto:</span>{" "}
                    {reservation.table.brojStola}
                  </p>
                  <p>
                    <span className="font-semibold">Datum i vreme:</span>{" "}
                    {formatDate(reservation.dateTime)}
                  </p>
                  <p>
                    <span className="font-semibold">Broj osoba:</span>{" "}
                    {reservation.brojOsoba}
                  </p>
                </div>

                <div className="mt-6">
                  {reservation.status !== "CANCELLED" && (
                    <button
                      onClick={() => handleCancelReservation(reservation.id)}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition"
                    >
                      Otkaži rezervaciju
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}