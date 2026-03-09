"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "./components/Modal";
import Card from "./components/Card";
import Button from "./components/Button";
import RestaurantsMap from "./components/RestaurantsMap";

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
  const [deleteError, setDeleteError] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);

  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("default");

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

  const filteredRestaurants = useMemo(() => {
    let result = [...restaurants];

    if (search.trim() !== "") {
      result = result.filter((r) =>
        r.naziv.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortType === "name") {
      result.sort((a, b) => a.naziv.localeCompare(b.naziv));
    }

    return result;
  }, [restaurants, search, sortType]);

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
          {user?.uloga === "MANAGER" ? "Moji restorani" : "Istražite restorane"}
        </h1>

        <div className="flex flex-col md:flex-row gap-4 mt-5 mb-5">
          <input
            type="text"
            placeholder="Pretraži restoran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "10px",
              width: "100%",
              maxWidth: 400,
              borderRadius: 8,
              border: "1px solid #ccc",
              color: "black",
              backgroundColor: "white",
            }}
          />

          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: 8,
              border: "1px solid #ccc",
              color: "black",
              backgroundColor: "white",
              minWidth: 250,
            }}
          >
            <option value="default">Podrazumevan redosled</option>
            <option value="name">Sortiraj po nazivu</option>
          </select>
        </div>

        <p style={{ color: "#555", marginBottom: 18 }}>
          {user?.uloga === "MANAGER"
            ? "Pregledajte restorane kojima upravljate i upravljajte njihovim podacima."
            : "Pregledajte dostupne restorane i rezervišite sto u željenom terminu."}
        </p>

        {!loading && !greska && (
          <p className="text-zinc-600 mb-4">
            Pronađeno restorana: {filteredRestaurants.length}
          </p>
        )}

        {loading && <p>Učitavanje restorana...</p>}

        {greska && (
          <p className="text-red-600 font-medium mb-4">{greska}</p>
        )}

        {!loading && !greska && filteredRestaurants.length === 0 && (
          <p className="text-zinc-600">Trenutno nema restorana u ponudi.</p>
        )}

        {!loading && !greska && filteredRestaurants.length > 0 && (
          <section style={{ marginTop: 28 }}>
            <h2 className="text-2xl font-semibold text-zinc-900 mt-10 mb-4">
              {search
                ? "Rezultati pretrage"
                : user?.uloga === "MANAGER"
                  ? "Restorani koje vodite"
                  : "Svi restorani"}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 18,
              }}
            >
              {filteredRestaurants.map((r) => (
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
                    variant="success"
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
        <RestaurantsMap />
      </div>
    </main>
  );
}