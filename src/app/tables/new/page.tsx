"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type RestaurantOption = {
  id: number;
  naziv: string;
};

type TableType = {
  id: number;
  brojStola: number;
  kapacitet: number;
  restoranId: number;
};

export default function NewTablePage() {
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);
  const [tables, setTables] = useState<TableType[]>([]);

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
          cache: "no-store",
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

  useEffect(() => {
    async function loadTables() {
      try {
        const res = await fetch("/api/tables", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          return;
        }

        const normalized: TableType[] = data.map((table: any) => ({
          id: table.id,
          brojStola: table.brojStola,
          kapacitet: table.kapacitet,
          restoranId: table.restoranId,
        }));

        setTables(normalized);
      } catch {
        // ne prikazujemo dodatnu grešku ovde
      }
    }

    loadTables();
  }, []);

  const selectedRestaurantTables = useMemo(() => {
    return tables.filter((table) => String(table.restoranId) === restoranId);
  }, [tables, restoranId]);

  function resetMessages() {
    setGreska("");
    setUspeh("");
  }

  function validateInputs() {
    if (!restoranId || !brojStola || !kapacitet) {
      setGreska("Izaberite restoran i unesite broj stola i kapacitet");
      return false;
    }

    if (Number(brojStola) < 1 || Number(kapacitet) < 1) {
      setGreska("Broj stola i kapacitet moraju biti veći od 0");
      return false;
    }

    return true;
  }

  function findExistingTable() {
    return tables.find(
      (table) =>
        String(table.restoranId) === restoranId &&
        table.brojStola === Number(brojStola) &&
        table.kapacitet === Number(kapacitet)
    );
  }

  async function refreshTables() {
    const res = await fetch("/api/tables", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) return;

    const normalized: TableType[] = data.map((table: any) => ({
      id: table.id,
      brojStola: table.brojStola,
      kapacitet: table.kapacitet,
      restoranId: table.restoranId,
    }));

    setTables(normalized);
  }

  async function handleCreateTable() {
    resetMessages();

    if (!validateInputs()) return;

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
          brojStola: Math.max(1, Number(brojStola)),
          kapacitet: Math.max(1, Number(kapacitet)),
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
      await refreshTables();
    } catch {
      setGreska("Greška na serveru");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateTable() {
    resetMessages();

    if (!validateInputs()) return;

    const existingTable = findExistingTable();

    if (!existingTable) {
      setGreska("Sto sa tim brojem ne postoji u izabranom restoranu.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/tables/${existingTable.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          brojStola: Math.max(1, Number(brojStola)),
          kapacitet: Math.max(1, Number(kapacitet)),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGreska(data.error || "Greška pri izmeni stola");
        return;
      }

      setUspeh("Sto je uspešno izmenjen.");
      setBrojStola("");
      setKapacitet("");
      await refreshTables();
    } catch {
      setGreska("Greška na serveru");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTable() {
    resetMessages();

    if (!restoranId || !brojStola) {
      setGreska("Izaberite restoran i unesite broj stola.");
      return;
    }

    const existingTable = findExistingTable();

    if (!existingTable) {
      setGreska("Sto sa tim brojem ne postoji u izabranom restoranu.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/tables/${existingTable.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setGreska(data.error || "Greška pri brisanju stola");
        return;
      }

      setUspeh("Sto je uspešno obrisan.");
      setBrojStola("");
      setKapacitet("");
      await refreshTables();
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
          Upravljanje stolovima
        </h1>

        <p className="text-zinc-500 text-lg mb-8">
          Izaberite restoran i unesite podatke o stolu.
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
              <input
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-4 text-black outline-none"
                type="number"
                min="1"
                placeholder="Unesite broj stola"
                value={brojStola}
                onKeyDown={(e) => e.key === "-" && e.preventDefault()}
                onChange={(e) => setBrojStola(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-zinc-800 mb-2 font-medium">
                Kapacitet
              </label>
              <input
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-4 text-black outline-none"
                type="number"
                min="1"
                placeholder="Unesite kapacitet"
                value={kapacitet}
                onKeyDown={(e) => e.key === "-" && e.preventDefault()}
                onChange={(e) => setKapacitet(e.target.value)}
              />
            </div>

            {selectedRestaurantTables.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-700 mb-2">
                  Stolovi za izabrani restoran:
                </p>
                <div className="space-y-1 text-sm text-zinc-700">
                  {selectedRestaurantTables.map((table) => (
                    <p key={table.id}>
                      Sto {table.brojStola} - kapacitet {table.kapacitet}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {greska && <p className="text-red-500">{greska}</p>}
            {uspeh && <p className="text-green-600">{uspeh}</p>}

            <div className="grid gap-3 pt-2">
              <button
                onClick={handleCreateTable}
                disabled={loading}
                className="w-full rounded-2xl bg-green-500 py-4 text-lg font-semibold text-white hover:bg-green-600 disabled:opacity-60"
              >
                {loading ? "Obrada..." : "Dodaj sto"}
              </button>

              <button
                onClick={handleUpdateTable}
                disabled={loading}
                className="w-full rounded-2xl bg-green-500 py-4 text-lg font-semibold text-white hover:bg-green-600 disabled:opacity-60"
              >
                {loading ? "Obrada..." : "Izmeni sto"}
              </button>

              <button
                onClick={handleDeleteTable}
                disabled={loading}
                className="w-full rounded-2xl bg-green-500 py-4 text-lg font-semibold text-white hover:bg-green-600 disabled:opacity-60"
              >
                {loading ? "Obrada..." : "Obriši sto"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}