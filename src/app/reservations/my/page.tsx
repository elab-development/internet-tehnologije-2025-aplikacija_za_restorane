"use client";

import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import Input from "../../components/Input";

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
      radnoVreme?: string;
    };
  };
};

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [greska, setGreska] = useState("");

  const [openEdit, setOpenEdit] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  const [editDateTime, setEditDateTime] = useState("");
  const [editBrojOsoba, setEditBrojOsoba] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

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

  function openEditModal(reservation: Reservation) {
    setSelectedReservation(reservation);
    setEditError("");
    setEditSuccess("");

    const dt = new Date(reservation.dateTime);
    const localDateTime = new Date(
      dt.getTime() - dt.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);

    setEditDateTime(localDateTime);
    setEditBrojOsoba(String(reservation.brojOsoba));
    setOpenEdit(true);
  }

  async function handleUpdateReservation() {
    if (!selectedReservation) return;

    setEditError("");
    setEditSuccess("");

    if (!editDateTime || !editBrojOsoba) {
      setEditError("Unesite datum/vreme i broj osoba");
      return;
    }

    try {
      setEditLoading(true);

      const res = await fetch(`/api/reservations/${selectedReservation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          dateTime: new Date(editDateTime).toISOString(),
          brojOsoba: Number(editBrojOsoba),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEditError(data.error || "Izmena rezervacije nije moguća");
        return;
      }

      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === selectedReservation.id
            ? {
                ...reservation,
                dateTime: data.dateTime,
                brojOsoba: data.brojOsoba,
                status: data.status,
              }
            : reservation
        )
      );

      setEditSuccess("Rezervacija je uspešno izmenjena.");

      setTimeout(() => {
        setOpenEdit(false);
        setSelectedReservation(null);
      }, 1000);
    } catch {
      setEditError("Greška na serveru");
    } finally {
      setEditLoading(false);
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

                <div className="mt-6 flex gap-3">
                  {reservation.status !== "CANCELLED" && (
                    <>
                      <button
                        onClick={() => openEditModal(reservation)}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition"
                      >
                        Izmeni rezervaciju
                      </button>

                      <button
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition"
                      >
                        Otkaži rezervaciju
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={openEdit}
        title="Izmena rezervacije"
        onClose={() => {
          setOpenEdit(false);
          setSelectedReservation(null);
          setEditError("");
          setEditSuccess("");
        }}
      >
        {selectedReservation && (
          <>
            <div style={{ lineHeight: 1.8 }}>
              <div>
                <b>Restoran:</b> {selectedReservation.table.restaurant.naziv}
              </div>
              <div>
                <b>Adresa:</b> {selectedReservation.table.restaurant.adresa}
              </div>
              <div>
                <b>Sto:</b> #{selectedReservation.table.brojStola}
              </div>
              <div>
                <b>Kapacitet stola:</b> {selectedReservation.table.kapacitet}
              </div>
              {selectedReservation.table.restaurant.radnoVreme && (
                <div>
                  <b>Radno vreme:</b>{" "}
                  {selectedReservation.table.restaurant.radnoVreme}
                </div>
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              <label
                htmlFor="editDateTime"
                style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
              >
                Novi datum i vreme
              </label>

              <input
                id="editDateTime"
                type="datetime-local"
                value={editDateTime}
                onChange={(e) => setEditDateTime(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  color: "black",
                  backgroundColor: "white",
                }}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <Input
                type="number"
                placeholder="Broj osoba"
                value={editBrojOsoba}
                onChange={(e) => setEditBrojOsoba(e.target.value)}
              />
            </div>

            {editError && (
              <p style={{ color: "red", marginTop: 12 }}>{editError}</p>
            )}

            {editSuccess && (
              <p style={{ color: "green", marginTop: 12 }}>{editSuccess}</p>
            )}

            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button
                onClick={handleUpdateReservation}
                disabled={editLoading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition"
              >
                {editLoading ? "Čuvanje..." : "Sačuvaj izmene"}
              </button>

              <button
                onClick={() => {
                  setOpenEdit(false);
                  setSelectedReservation(null);
                  setEditError("");
                  setEditSuccess("");
                }}
                className="bg-zinc-700 hover:bg-zinc-800 text-white font-semibold px-6 py-3 rounded-xl transition"
              >
                Otkaži
              </button>
            </div>
          </>
        )}
      </Modal>
    </main>
  );
}