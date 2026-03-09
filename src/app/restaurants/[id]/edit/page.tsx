"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "../../../components/Button";
import Input from "../../../components/Input";

export default function EditRestaurantPage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id;

  const [naziv, setNaziv] = useState("");
  const [adresa, setAdresa] = useState("");
  const [opis, setOpis] = useState("");
  const [radnoVreme, setRadnoVreme] = useState("");

  const [loading, setLoading] = useState(true);
  const [greska, setGreska] = useState("");

  useEffect(() => {
    async function loadRestaurant() {
      try {
        const res = await fetch(`/api/restaurants/${id}`);

        const data = await res.json();

        if (!res.ok) {
          setGreska(data.error || "Greška pri učitavanju restorana");
          return;
        }

        setNaziv(data.naziv);
        setAdresa(data.adresa);
        setOpis(data.opis || "");
        setRadnoVreme(data.radnoVreme);
      } catch {
        setGreska("Greška na serveru");
      } finally {
        setLoading(false);
      }
    }

    loadRestaurant();
  }, [id]);

  async function handleUpdate() {
    try {
      setGreska("");

      const res = await fetch(`/api/restaurants/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          naziv,
          adresa,
          opis,
          radnoVreme,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGreska(data.error || "Greška pri izmeni restorana");
        return;
      }

      router.push("/");
    } catch {
      setGreska("Greška na serveru");
    }
  }

  if (loading) {
    return <p className="p-6">Učitavanje...</p>;
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">

        <h1 className="text-2xl font-bold mb-6 text-black">
          Izmeni restoran
        </h1>

        {greska && (
          <p className="text-red-600 mb-4">{greska}</p>
        )}

        <div className="space-y-4">

          <Input
            placeholder="Naziv restorana"
            value={naziv}
            onChange={(e) => setNaziv(e.target.value)}
          />

          <Input
            placeholder="Adresa"
            value={adresa}
            onChange={(e) => setAdresa(e.target.value)}
          />

          <Input
            placeholder="Radno vreme (npr 08:00-23:00)"
            value={radnoVreme}
            onChange={(e) => setRadnoVreme(e.target.value)}
          />

          <textarea
            placeholder="Opis restorana"
            value={opis}
            onChange={(e) => setOpis(e.target.value)}
            className="w-full border rounded p-2 text-black"
          />

        </div>

        <div className="mt-6 flex gap-3">

          <Button variant="primary" onClick={handleUpdate}>
            Sačuvaj izmene
          </Button>

          <Button
            variant="secondary"
            onClick={() => router.push("/")}
          >
            Otkaži
          </Button>

        </div>

      </div>
    </main>
  );
}