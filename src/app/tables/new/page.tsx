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
    <main className="min-h-screen bg-zinc-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-md p-10">
        <h1 className="text-4xl font-bold text-zinc-900 mb-4">
          Dodavanje stola
        </h1>

        <p className="text-zinc-500 text-lg mb-8">
          Izaberite restoran i unesite podatke o novom stolu.
        </p>

        {loadingRestaurants ? (
          <p className="text-zinc-600">Učitavanje restorana...</p>
        ) : restaurants.length === 0 ? (
          <p className="text-red-500">
            Nemate nijedan restoran. Prvo dodajte restoran.
          </p>
        ) : (
          <div className="space-y-5">
            <div>
              <label
                htmlFor="restoran"
                className="block text-zinc-800 mb-2 font-medium"
              >
                Restoran
              </label>

              <select
                id="restoran"
                value={restoranId}
                onChange={(e) => setRestoranId(e.target.value)}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-4 text-black outline-none"
              >
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.naziv}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-800 mb-2 font-medium">
                Broj stola
              </label>
              <Input
                type="number"
                placeholder="Unesite broj stola"
                value={brojStola}
                onChange={(e) => setBrojStola(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-zinc-800 mb-2 font-medium">
                Kapacitet
              </label>
              <Input
                type="number"
                placeholder="Unesite kapacitet"
                value={kapacitet}
                onChange={(e) => setKapacitet(e.target.value)}
              />
            </div>

            {greska && <p className="text-red-500">{greska}</p>}
            {uspeh && <p className="text-green-600">{uspeh}</p>}

            <div className="pt-2">
              <button
                onClick={handleCreateTable}
                disabled={loading}
                className="w-full rounded-2xl bg-green-500 py-4 text-lg font-semibold text-white hover:bg-green-600 disabled:opacity-60"
              >
                {loading ? "Dodavanje..." : "Dodaj sto"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}