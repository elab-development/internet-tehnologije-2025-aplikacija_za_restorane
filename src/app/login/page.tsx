"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/Button";
import Input from "../components/Input";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [greska, setGreska] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setGreska("");

    if (!email || !lozinka) {
      setGreska("Unesite email i lozinku");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          lozinka,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGreska(data.error || "Greška pri prijavi");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setGreska("Greška na serveru");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-xl p-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">
            Dobrodošli nazad!
          </h1>
          <p className="text-zinc-500">
            Prijavite se i nastavite sa korišćenjem aplikacije.
          </p>
        </div>

        <div className="space-y-4">

          <div>
            <label className="text-sm font-medium text-zinc-700">
              Email
            </label>
            <Input
              type="email"
              placeholder="Unesite email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700">
              Lozinka
            </label>
            <Input
              type="password"
              placeholder="Unesite lozinku"
              value={lozinka}
              onChange={(e) => setLozinka(e.target.value)}
            />

            <div className="text-right mt-2">
              <Link
                href="/forgot-password"
                className="text-sm text-green-600 hover:text-green-700"
              >
                Zaboravili ste lozinku?
              </Link>
            </div>
          </div>

        </div>

        {greska && (
          <p className="text-red-600 text-sm mt-4">
            {greska}
          </p>
        )}

        <div className="mt-6">
          <button
            onClick={handleLogin}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? "Prijavljivanje..." : "Prijavi se"}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-zinc-500">
          Nemate nalog?{" "}
          <Link
            href="/register"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Registrujte se
          </Link>
        </div>

      </div>
    </main>
  );
}