"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../../components/Button";
import Input from "../../components/Input";

type RestaurantOption = {
  id: number;
  naziv: string;
};

export default function NewTablePage() {
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);
  const [restoranId, setRestoranId] = useState("");
  const [brojStola, setBrojStola] = useState("");
  const [kapacitet, setKapacitet] = useState("");

  const [greska, setGreska] = useState("");
  const [uspeh, setUspeh] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);

  useEffect(() => {
    async function loadMyRestaurants() {
      try {
        setLoadingRestaurants(true);
        setGreska("");

        const res = await fetch("/api/my-restaurants", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          setGreska(data.error || "Greška pri učitavanju restorana");
          return;
        }

        setRestaurants(data);

        if (data.length > 0) {
          setRestoranId(String(data[0].id));
        }
      } catch {
        setGreska("Greška na serveru");
      } finally {
        setLoadingRestaurants(false);
      }
    }

    loadMyRestaurants();
  }, []);

  async function handleCreateTable() {
    setGreska("");
    setUspeh("");

    if (!restoranId || !brojStola || !kapacitet) {
      setGreska("Izaberite restoran i unesite broj stola i kapacitet");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          restoranId: Number(restoranId),
          brojStola: Number(brojStola),
          kapacitet: Number(kapacitet),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGreska(data.error || "Greška pri dodavanju stola");
        return;
      }

      setUspeh("Sto je uspešno dodat.");
      setBrojStola("");
      setKapacitet("");

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1000);
    } catch {
      setGreska("Greška na serveru");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 500 }}>
      <h1>Dodavanje stola</h1>

      {loadingRestaurants ? (
        <p>Učitavanje restorana...</p>
      ) : restaurants.length === 0 ? (
        <p style={{ color: "red" }}>
          Nemate nijedan restoran. Prvo dodajte restoran.
        </p>
      ) : (
        <>
          <div style={{ marginTop: 12 }}>
            <label
              htmlFor="restoran"
              style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
            >
              Restoran
            </label>

            <select
              id="restoran"
              value={restoranId}
              onChange={(e) => setRestoranId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            >
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.naziv}
                </option>
              ))}
            </select>
          </div>

          <Input
            type="number"
            placeholder="Broj stola"
            value={brojStola}
            onChange={(e) => setBrojStola(e.target.value)}
          />

          <Input
            type="number"
            placeholder="Kapacitet"
            value={kapacitet}
            onChange={(e) => setKapacitet(e.target.value)}
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
            <Button variant="primary" onClick={handleCreateTable}>
              {loading ? "Dodavanje..." : "Dodaj sto"}
            </Button>
          </div>
        </>
      )}
    </main>
  );
}