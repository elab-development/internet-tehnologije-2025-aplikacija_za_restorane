"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/Button";
import Input from "../components/Input";

export default function RegisterPage() {
  const router = useRouter();

  const [ime, setIme] = useState("");
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [uloga, setUloga] = useState("GUEST");
  const [greska, setGreska] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setGreska("");

    if (!ime || !email || !lozinka) {
      setGreska("Unesite ime, email i lozinku");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ime,
          email,
          lozinka,
          uloga,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGreska(data.error || "Greška pri registraciji");
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
    <main className="min-h-screen bg-zinc-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-md p-10">
        <h1 className="text-4xl font-bold text-zinc-900 mb-4">Registracija</h1>

        <p className="text-zinc-500 text-lg mb-8">
          Napravite nalog i nastavite sa korišćenjem aplikacije.
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-zinc-800 mb-2 font-medium">Ime</label>
            <Input
              type="text"
              placeholder="Unesite ime"
              value={ime}
              onChange={(e) => setIme(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-zinc-800 mb-2 font-medium">Email</label>
            <Input
              type="email"
              placeholder="Unesite email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-zinc-800 mb-2 font-medium">Lozinka</label>
            <Input
              type="password"
              placeholder="Unesite lozinku"
              value={lozinka}
              onChange={(e) => setLozinka(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="uloga"
              className="block text-zinc-800 mb-2 font-medium"
            >
              Uloga
            </label>

            <select
              id="uloga"
              value={uloga}
              onChange={(e) => setUloga(e.target.value)}
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-4 text-black outline-none"
            >
              <option value="GUEST">Guest</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>

          {greska && <p className="text-red-500">{greska}</p>}

          <div className="pt-2">
            <Button variant="success" onClick={handleRegister}>
              {loading ? "Registracija..." : "Registruj se"}
            </Button>
          </div>

          <p className="text-center text-zinc-500">
            Već imate nalog?{" "}
            <a href="/login" className="text-green-600 font-medium">
              Prijavite se
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}