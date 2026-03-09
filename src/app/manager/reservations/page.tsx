"use client";

import { useEffect, useState } from "react";
import Button from "../../components/Button";

type ReservationRequest = {
  id: number;
  dateTime: string;
  brojOsoba: number;
  status: string;
  user: {
    id: number;
    ime: string;
    email: string;
  };
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

export default function ManagerReservationsPage() {
  const [requests, setRequests] = useState<ReservationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [greska, setGreska] = useState("");

  useEffect(() => {
    async function loadRequests() {
      try {
        setLoading(true);
        setGreska("");

        const res = await fetch("/api/manager/reservation-requests", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          setGreska(data.error || "Greška pri učitavanju zahteva");
          return;
        }

        setRequests(data);
      } catch {
        setGreska("Greška na serveru");
      } finally {
        setLoading(false);
      }
    }

    loadRequests();
  }, []);

  async function handleUpdateStatus(
    id: number,
    status: "CONFIRMED" | "CANCELLED"
  ) {
    try {
      const res = await fetch(`/api/manager/reservation-requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGreska(data.error || "Greška pri obradi zahteva");
        return;
      }

      setRequests((prev) => prev.filter((request) => request.id !== id));
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

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900">
          Zahtevi za rezervaciju
        </h1>

        <p className="text-zinc-600 mt-2 mb-6">
          Ovde možete da odobrite ili odbijete pending rezervacije.
        </p>

        {loading && <p>Učitavanje zahteva...</p>}

        {greska && <p className="text-red-600">{greska}</p>}

        {!loading && !greska && requests.length === 0 && (
          <p className="text-zinc-600">Trenutno nema pending zahteva.</p>
        )}

        {!loading && !greska && requests.length > 0 && (
          <div className="space-y-5">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white border rounded-2xl shadow-md p-6 hover:shadow-lg transition"
              >
                <h2 className="text-2xl font-semibold text-zinc-900 flex items-center gap-2">
                  🍽 {request.table.restaurant.naziv}
                </h2>

                <p className="text-zinc-600 mt-1">
                  📍 {request.table.restaurant.adresa}
                </p>

                <hr className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-zinc-800">
                  <p>
                    👤 <b>Korisnik:</b> {request.user.ime} ({request.user.email})
                  </p>

                  <p>
                    🍽️ <b>Sto:</b> {request.table.brojStola}
                  </p>

                  <p>
                    📅 <b>Datum i vreme:</b> {formatDate(request.dateTime)}
                  </p>

                  <p>
                    👥 <b>Broj osoba:</b> {request.brojOsoba}
                  </p>

                  <div className="flex items-center gap-2 md:col-span-2">
                    <b>Status:</b>
                    <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                      {request.status}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <Button
                    variant="success"
                    onClick={() => handleUpdateStatus(request.id, "CONFIRMED")}
                  >
                    Odobri
                  </Button>

                  <button
                    onClick={() => handleUpdateStatus(request.id, "CANCELLED")}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded transition"
                  >
                    Odbij
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}