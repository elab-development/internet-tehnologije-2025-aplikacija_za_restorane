"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "../../../components/Button";
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
    <main style={{ padding: 24, maxWidth: 600 }}>
      {loadingRestaurant ? (
        <p>Učitavanje restorana...</p>
      ) : greska && !restaurant ? (
        <p style={{ color: "red" }}>{greska}</p>
      ) : restaurant ? (
        <>
          <h1>Rezervacija restorana</h1>

          <div style={{ marginTop: 16, marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 600 }}>{restaurant.naziv}</h2>
            <p>{restaurant.adresa}</p>
            <p>{restaurant.opis || "Ovaj restoran nema dodatni opis."}</p>
            <p>
              <b>Radno vreme:</b> {restaurant.radnoVreme}
            </p>
          </div>

          {restaurant.tables.length === 0 ? (
            <p style={{ color: "red" }}>
              Ovaj restoran trenutno nema dostupnih stolova.
            </p>
          ) : (
            <>
              <div style={{ marginTop: 12 }}>
                <label
                  htmlFor="table"
                  style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
                >
                  Izaberite sto
                </label>

                <select
                  id="table"
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                  }}
                >
                  {restaurant.tables.map((table) => (
                    <option key={table.id} value={table.id}>
                      Sto #{table.brojStola} — kapacitet {table.kapacitet}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: 12 }}>
                <label
                  htmlFor="dateTime"
                  style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
                >
                  Datum i vreme
                </label>

                <input
                  id="dateTime"
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>

              <Input
                type="number"
                placeholder="Broj osoba"
                value={brojOsoba}
                onChange={(e) => setBrojOsoba(e.target.value)}
              />

              {greska && (
                <p style={{ color: "red", marginTop: 12 }}>
                  {greska}
                </p>
              )}

              {uspeh && (
                <p style={{ color: "green", marginTop: 12 }}>
                  {uspeh}
                </p>
              )}

              <div style={{ marginTop: 16 }}>
                <Button variant="primary" onClick={handleReservation}>
                  {loadingSubmit ? "Rezervisanje..." : "Potvrdi rezervaciju"}
                </Button>
              </div>
            </>
          )}
        </>
      ) : null}
    </main>
  );
}