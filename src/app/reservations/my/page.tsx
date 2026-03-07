"use client";

import { useEffect, useState } from "react";
import Button from "../../components/Button";

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

  async function handleDeleteReservation(id: number) {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setGreska(data.error || "Greška pri brisanju rezervacije");
        return;
      }

      setReservations((prev) => prev.filter((reservation) => reservation.id !== id));
    } catch {
      setGreska("Greška na serveru");
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);

    return date.toLocaleString("sr-RS", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900">Moje rezervacije</h1>

        <p className="text-zinc-600 mt-2 mb-6">
          Ovde možete videti sve vaše rezervacije.
        </p>

        {loading && <p>Učitavanje rezervacija...</p>}

        {greska && <p className="text-red-600">{greska}</p>}

        {!loading && !greska && reservations.length === 0 && (
          <p className="text-zinc-600">Trenutno nemate nijednu rezervaciju.</p>
        )}

        {!loading && !greska && reservations.length > 0 && (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white border rounded-lg shadow-sm p-5"
              >
                <h2 className="text-xl font-semibold text-zinc-900">
                  {reservation.table.restaurant.naziv}
                </h2>

                <p className="text-zinc-600 mt-1">
                  {reservation.table.restaurant.adresa}
                </p>

                <div className="mt-3 space-y-1 text-zinc-800">
                  <p>
                    <b>Sto:</b> #{reservation.table.brojStola}
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

                <div className="mt-4">
                  <Button
                    variant="primary"
                    onClick={() => handleDeleteReservation(reservation.id)}
                  >
                    Otkaži rezervaciju
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}