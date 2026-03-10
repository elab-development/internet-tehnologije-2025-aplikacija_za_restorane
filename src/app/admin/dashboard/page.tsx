"use client";

import { useEffect, useState } from "react";

type StatsType = {
  users: number;
  restaurants: number;
  reservations: number;
  managers: number;
  guests: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [greska, setGreska] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setGreska("");

        const [usersRes, restaurantsRes, reservationsRes] = await Promise.all([
          fetch("/api/users", {
            credentials: "include",
            cache: "no-store",
          }),
          fetch("/api/restaurants", {
            credentials: "include",
            cache: "no-store",
          }),
          fetch("/api/reservations", {
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        const users = await usersRes.json();
        const restaurants = await restaurantsRes.json();
        const reservations = await reservationsRes.json();

        if (!usersRes.ok || !restaurantsRes.ok || !reservationsRes.ok) {
          setGreska("Greška pri učitavanju statistike");
          return;
        }

        setStats({
          users: users.length,
          restaurants: restaurants.length,
          reservations: reservations.length,
          managers: users.filter((u: any) => u.uloga === "MANAGER").length,
          guests: users.filter((u: any) => u.uloga === "GUEST").length,
        });
      } catch {
        setGreska("Greška na serveru");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900">
          Statistika sistema
        </h1>

        <p className="text-zinc-600 mt-2 mb-6">
          Pregled osnovnih podataka o radu sistema.
        </p>

        {loading && <p>Učitavanje statistike...</p>}
        {greska && <p className="text-red-600">{greska}</p>}

        {stats && (
          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-white border rounded-2xl shadow-sm p-6">
              <p className="text-zinc-500">Ukupan broj korisnika</p>
              <h2 className="text-black text-3xl font-bold mt-2">{stats.users}</h2>
            </div>

            <div className="bg-white border rounded-2xl shadow-sm p-6">
              <p className="text-zinc-500">Ukupan broj restorana</p>
              <h2 className="text-black text-3xl font-bold mt-2">{stats.restaurants}</h2>
            </div>

            <div className="bg-white border rounded-2xl shadow-sm p-6">
              <p className="text-zinc-500">Ukupan broj rezervacija</p>
              <h2 className="text-black text-3xl font-bold mt-2">{stats.reservations}</h2>
            </div>

            <div className="bg-white border rounded-2xl shadow-sm p-6">
              <p className="text-zinc-500">Broj menadžera</p>
              <h2 className="text-black text-3xl font-bold mt-2">{stats.managers}</h2>
            </div>

            <div className="bg-white border rounded-2xl shadow-sm p-6">
              <p className="text-zinc-500">Broj gostiju</p>
              <h2 className="text-black text-3xl font-bold mt-2">{stats.guests}</h2>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}