"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "../../../components/Input";

type TableType = {
  id: number;
  brojStola: number;
  kapacitet: number;
};

type RestaurantType = {
  id: number;
  naziv: string;
  adresa: string;
  opis: string | null;
  radnoVreme: string;
  tables: TableType[];
};

export default function ReservePage() {
  const params = useParams();
  const router = useRouter();

  const restaurantId = useMemo(() => {
    const rawId = params.id;

    if (Array.isArray(rawId)) {
      return rawId[0];
    }

    return rawId;
  }, [params]);

  const [restaurant, setRestaurant] = useState<RestaurantType | null>(null);
  const [tableId, setTableId] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [brojOsoba, setBrojOsoba] = useState("");
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [greska, setGreska] = useState("");
  const [uspeh, setUspeh] = useState("");

  useEffect(() => {
    async function loadRestaurant() {
      if (!restaurantId) {
        setGreska("Nevalidan id restorana.");
        setLoadingRestaurant(false);
        return;
      }

      try {
        setLoadingRestaurant(true);
        setGreska("");

        const res = await fetch(`/api/restaurants/${restaurantId}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          setGreska(data.error || "Greška pri učitavanju restorana");
          return;
        }

        setRestaurant(data);

        if (data.tables && data.tables.length > 0) {
          setTableId(String(data.tables[0].id));
        }
      } catch {
        setGreska("Greška na serveru");
      } finally {
        setLoadingRestaurant(false);
      }
    }

    loadRestaurant();
  }, [restaurantId]);

  const selectedTable = useMemo(() => {
    if (!restaurant || !tableId) return null;
    return (
      restaurant.tables.find((table) => String(table.id) === tableId) || null
    );
  }, [restaurant, tableId]);

  const minDateTime = useMemo(() => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
  }, []);


  async function handleReservation() {
    setGreska("");
    setUspeh("");

    if (!tableId || !dateTime || !brojOsoba) {
      setGreska("Izaberite sto, datum/vreme i broj osoba");
      return;
    }

    try {
      setLoadingSubmit(true);

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          tableId: Number(tableId),
          dateTime: new Date(dateTime).toISOString(),
          brojOsoba: Number(brojOsoba),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setGreska("Morate biti prijavljeni da biste napravili rezervaciju.");
          return;
        }

        setGreska(data.error || "Greška pri kreiranju rezervacije");
        return;
      }

      setUspeh("Rezervacija je uspešno kreirana.");

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1200);
    } catch {
      setGreska("Greška na serveru");
    } finally {
      setLoadingSubmit(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        {loadingRestaurant ? (
          <p className="text-zinc-600">Učitavanje restorana...</p>
        ) : greska && !restaurant ? (
          <p className="text-red-600">{greska}</p>
        ) : restaurant ? (
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-8">
            <div className="mb-8">
            

              <h1 className="text-3xl font-bold text-zinc-900 mb-3">
                {restaurant.naziv}
              </h1>

              <div className="space-y-2 text-zinc-700">
                <p>{restaurant.adresa}</p>
                <p>{restaurant.opis || "Ovaj restoran nema dodatni opis."}</p>
                <p>
                  <span className="font-semibold">Radno vreme:</span>{" "}
                  {restaurant.radnoVreme}
                </p>
              </div>
            </div>

            {restaurant.tables.length === 0 ? (
              <p className="text-red-600">
                Ovaj restoran trenutno nema dostupnih stolova.
              </p>
            ) : (
              <>
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="table"
                      className="block text-sm font-medium text-zinc-700 mb-2"
                    >
                      Izaberite sto
                    </label>

                    <select
                      id="table"
                      value={tableId}
                      onChange={(e) => {
                        const newTableId = e.target.value;
                        setTableId(newTableId);

                        if (restaurant) {
                          const table = restaurant.tables.find(
                            (t) => String(t.id) === newTableId
                          );

                          if (table && brojOsoba) {
                            const broj = Number(brojOsoba);
                            if (broj > table.kapacitet) {
                              setBrojOsoba(String(table.kapacitet));
                            }
                          }
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1px solid #d4d4d8",
                        backgroundColor: "#ffffff",
                        color: "#18181b",
                        outline: "none",
                      }}
                    >
                      {restaurant.tables.map((table) => (
                        <option key={table.id} value={table.id}>
                          Sto {table.brojStola} - kapacitet {table.kapacitet}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="dateTime"
                      className="block text-sm font-medium text-zinc-700 mb-2"
                    >
                      Datum i vreme
                    </label>

                    <input
                      id="dateTime"
                      type="datetime-local"
                      value={dateTime}
                      min={minDateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "12px",
                        border: "1px solid #d4d4d8",
                        backgroundColor: "#ffffff",
                        color: "#18181b",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Broj osoba
                    </label>
                    <Input
                      type="number"
                      placeholder="Unesite broj osoba"
                      value={brojOsoba}
                      onChange={(e) => {
                        const value = e.target.value;

                        if (value === "") {
                          setBrojOsoba("");
                          return;
                        }

                        const broj = Number(value);

                        if (!Number.isFinite(broj)) return;
                        if (broj < 1) return;

                        if (selectedTable && broj > selectedTable.kapacitet) {
                          setBrojOsoba(String(selectedTable.kapacitet));
                          return;
                        }

                        setBrojOsoba(value);
                      }}
                    />

                    {selectedTable && (
                      <p className="text-sm text-zinc-500 mt-2">
                        * Maksimalan broj osoba za izabrani sto je{" "}
                        {selectedTable.kapacitet}.
                      </p>
                    )}
                  </div>
                </div>

                {greska && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-red-600 text-sm">{greska}</p>
                  </div>
                )}

                {uspeh && (
                  <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                    <p className="text-green-700 text-sm">{uspeh}</p>
                  </div>
                )}

                <div className="mt-6">
                  <button
                    onClick={handleReservation}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition"
                  >
                    {loadingSubmit
                      ? "Rezervisanje..."
                      : "Potvrdi rezervaciju"}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}