"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "./components/Modal";
import Card from "./components/Card";
import Button from "./components/Button";

type Restaurant = {
  id: number;
  naziv: string;
  adresa: string;
  opis: string | null;
  radnoVreme: string;
  administratorId: number;
};

type AuthUser = {
  id: number;
  uloga: "GUEST" | "MANAGER" | "ADMIN";
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    async function loadPageData() {
      try {
        setLoading(true);
        setGreska("");

        const meRes = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        let currentUser: AuthUser | null = null;

        if (meRes.ok) {
          currentUser = await meRes.json();
          setUser(currentUser);
        } else {
          setUser(null);
        }

        const endpoint =
          currentUser?.uloga === "MANAGER"
            ? "/api/my-restaurants"
            : "/api/restaurants";

        const res = await fetch(endpoint, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
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

    loadPageData();
  }, []);

async function handleDeleteRestaurant(id: number) {
  setDeleteError("");
  setGreska("");

  try {
    const res = await fetch(`/api/restaurants/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
      setDeleteError(data.error || "Greška pri brisanju restorana");
      return;
    }

    setOpen(false);
    setSelected(null);
    setRestaurants((prev) =>
      prev.filter((restaurant) => restaurant.id !== id)
    );
  } catch {
    setDeleteError("Greška na serveru");
  }
}

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900">
          {user?.uloga === "MANAGER" ? "Moji restorani" : "Restorani u ponudi"}
        </h1>

        <p className="text-zinc-600 mb-6">
          {user?.uloga === "MANAGER"
            ? "Pregled restorana kojima upravljate."
            : "Pregled restorana iz baze podataka."}
        </p>

        {loading && <p>Učitavanje restorana...</p>}

        {greska && (
          <p className="text-red-600 font-medium mb-4">{greska}</p>
        )}

        {!loading && !greska && restaurants.length === 0 && (
          <p className="text-zinc-600">Trenutno nema restorana u ponudi.</p>
        )}

        {!loading && !greska && restaurants.length > 0 && (
          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
              {user?.uloga === "MANAGER" ? "Vaši restorani" : "Svi restorani"}
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
                      setDeleteError("");
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
                {user?.uloga === "MANAGER" ? (
                  <Button
                    variant="primary"
                    onClick={() => handleDeleteRestaurant(selected.id)}
                  >
                    Obriši restoran
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    onClick={() => {
                      router.push(`/restaurants/${selected.id}/reserve`);
                    }}
                  >
                    Rezerviši sto
                  </Button>
                )}
              </div>
                  {deleteError && (
                    <p style={{ color: "red", marginTop: 12 }}>
                      {deleteError}
                    </p>
                  )}
            </>
          )}
        </Modal>
      </div>
    </main>
  );
}