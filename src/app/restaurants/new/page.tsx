"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../../components/Button";
import Input from "../../components/Input";

export default function NewRestaurantPage() {
  const router = useRouter();

  const [naziv, setNaziv] = useState("");
  const [adresa, setAdresa] = useState("");
  const [opis, setOpis] = useState("");
  const [radnoVreme, setRadnoVreme] = useState("");
  const [greska, setGreska] = useState("");
  const [uspeh, setUspeh] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateRestaurant() {
    setGreska("");
    setUspeh("");

    if (!naziv || !adresa || !radnoVreme) {
      setGreska("Unesite naziv, adresu i radno vreme");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/restaurants", {
        method: "POST",
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
        setGreska(data.error || "Greška pri kreiranju restorana");
        return;
      }

      setUspeh("Restoran je uspešno dodat.");

      setNaziv("");
      setAdresa("");
      setOpis("");
      setRadnoVreme("");

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
    <main className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-8">
          <div className="mb-8">
            
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">
              Dodavanje restorana
            </h1>
            <p className="text-zinc-500">
              Unesite osnovne informacije o restoranu koji želite da dodate.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Naziv restorana
              </label>
              <Input
                type="text"
                placeholder="Unesite naziv restorana"
                value={naziv}
                onChange={(e) => setNaziv(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Adresa
              </label>
              <Input
                type="text"
                placeholder="Unesite adresu"
                value={adresa}
                onChange={(e) => setAdresa(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Opis restorana
              </label>
              <textarea
                placeholder="Unesite kratak opis restorana"
                value={opis}
                onChange={(e) => setOpis(e.target.value)}
                rows={5}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #d4d4d8",
                  resize: "vertical",
                  backgroundColor: "#ffffff",
                  color: "#18181b",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Radno vreme
              </label>
              <Input
                type="text"
                placeholder="Na primer: 09:00-23:00"
                value={radnoVreme}
                onChange={(e) => setRadnoVreme(e.target.value)}
              />
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
              onClick={handleCreateRestaurant}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              {loading ? "Dodavanje..." : "Dodaj restoran"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}