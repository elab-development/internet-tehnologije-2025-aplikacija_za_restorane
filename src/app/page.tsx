"use client";

import { useEffect, useState } from "react";
import Modal from "./components/Modal";
import Card from "./components/Card";
import Button from "./components/Button";
import { useRouter } from "next/navigation";

type Restaurant = {
  id: number;
  naziv: string;
  adresa: string;
  opis: string | null;
  radnoVreme: string;
  administratorId: number;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop";

export default function Home() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [greska, setGreska] = useState("");

  useEffect(() => {
    async function loadRestaurants() {
      try {
        setLoading(true);
        setGreska("");

        const res = await fetch("/api/restaurants", {
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          setGreska(data.error || "Greška pri učitavanju restorana");
          return;
        }

        setRestaurants(data);
      } catch {
        setGreska("Greška na serveru");
      } finally {
        setLoading(false);
      }
    }

    loadRestaurants();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900">Restorani u ponudi</h1>

        <p className="text-zinc-600 mb-6">
          Pregled restorana iz baze podataka.
        </p>

        {loading && <p>Učitavanje restorana...</p>}

        {greska && (
          <p className="text-red-600 font-medium mb-4">{greska}</p>
        )}

        {!loading && !greska && restaurants.length === 0 && (
          <p>Trenutno nema restorana u bazi.</p>
        )}

        {!loading && !greska && restaurants.length > 0 && (
          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
              Svi restorani
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 18,
              }}
            >
              {restaurants.map((r) => (
                <Card
                  key={r.id}
                  title={r.naziv}
                  description={r.opis || "Restoran bez dodatnog opisa."}
                  imageUrl={fallbackImage}
                >
                  <Button
                    variant="success"
                    onClick={() => {
                      setSelected(r);
                      setOpen(true);
                    }}
                  >
                    Detalji
                  </Button>
                </Card>
              ))}
            </div>
          </section>
        )}

        <Modal
          isOpen={open}
          title={selected?.naziv || "Detalji"}
          onClose={() => setOpen(false)}
        >
          {selected && (
            <>
              <img
                src={fallbackImage}
                alt={selected.naziv}
                style={{
                  width: "100%",
                  height: 220,
                  objectFit: "cover",
                  borderRadius: 10,
                  display: "block",
                }}
              />

              <p style={{ marginTop: 12, fontSize: 16 }}>
                {selected.opis || "Ovaj restoran trenutno nema dodatni opis."}
              </p>

              <div style={{ marginTop: 12, lineHeight: 1.8 }}>
                <div>
                  <b>Adresa:</b> {selected.adresa}
                </div>
                <div>
                  <b>Radno vreme:</b> {selected.radnoVreme}
                </div>
              </div>

              <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                <Button
                    variant="success"
                    onClick={() => {
                      if (selected) {
                        router.push(`/restaurants/${selected.id}/reserve`);
                      }
                    }}
                  >
                    Rezerviši sto
                  </Button>
              </div>
            </>
          )}
        </Modal>
      </div>
    </main>
  );
}