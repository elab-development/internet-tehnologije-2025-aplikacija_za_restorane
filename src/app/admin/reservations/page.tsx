"use client";

import { useEffect, useState } from "react";

type ReservationType = {
  id: number;
  dateTime: string;
  brojOsoba: number;
  status: string;
  user: {
    ime: string;
    email: string;
  };
  table: {
    brojStola: number;
    restaurant: {
      naziv: string;
      adresa: string;
    };
  };
};

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<ReservationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [greska, setGreska] = useState("");

  useEffect(() => {
    async function loadReservations() {
      try {
        setLoading(true);
        setGreska("");

        const res = await fetch("/api/reservations", {
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

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900">
          Pregled svih rezervacija
        </h1>

        <p className="text-zinc-600 mt-2 mb-6">
          Ovde možete videti sve rezervacije u sistemu.
        </p>

        {loading && <p>Učitavanje rezervacija...</p>}
        {greska && <p className="text-red-600">{greska}</p>}

        {!loading && !greska && (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="text-black bg-white border rounded-2xl shadow-sm p-5"
              >
                <h2 className="text-xl font-semibold">
                  {reservation.table.restaurant.naziv}
                </h2>

                <p className="text-zinc-600 mt-1">
                  {reservation.table.restaurant.adresa}
                </p>

                <div className="mt-4 space-y-2">
                  <p>
                    <b>Korisnik:</b> {reservation.user.ime} (
                    {reservation.user.email})
                  </p>
                  <p>
                    <b>Sto:</b> {reservation.table.brojStola}
                  </p>
                  <p>
                    <b>Datum i vreme:</b> {formatDate(reservation.dateTime)}
                  </p>
                  <p>
                    <b>Broj osoba:</b> {reservation.brojOsoba}
                  </p>
                  <p>
                    <b>Status:</b> {reservation.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}