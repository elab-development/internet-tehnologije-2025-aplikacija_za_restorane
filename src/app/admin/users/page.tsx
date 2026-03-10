"use client";

import { useEffect, useState } from "react";

type UserType = {
  id: number;
  ime: string;
  email: string;
  uloga: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [greska, setGreska] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        setGreska("");

        const res = await fetch("/api/users", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          setGreska(data.error || "Greška pri učitavanju korisnika");
          return;
        }

        setUsers(data);

        const meRes = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (meRes.ok) {
          const meData = await meRes.json();
          setCurrentUserId(meData.id);
        }
      } catch {
        setGreska("Greška na serveru");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  async function handleDeleteUser(id: number) {
    if (!confirm("Da li ste sigurni da želite da obrišete korisnika?")) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Greška pri brisanju korisnika");
        return;
      }

      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch {
      alert("Greška na serveru");
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900">
          Pregled svih korisnika
        </h1>

        <p className="text-zinc-600 mt-2 mb-6">
          Ovde možete videti sve korisnike sistema.
        </p>

        {loading && <p>Učitavanje korisnika...</p>}
        {greska && <p className="text-red-600">{greska}</p>}

        {!loading && !greska && (
          <div className="text-black bg-white border rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-zinc-100">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Ime</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Uloga</th>
                  <th className="px-4 py-3">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-4 py-3">{user.id}</td>
                    <td className="px-4 py-3">{user.ime}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.uloga}</td>
                    <td className="px-4 py-3">
                      {user.id !== currentUserId && user.uloga !== "ADMIN" && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                        >
                          Obriši
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}