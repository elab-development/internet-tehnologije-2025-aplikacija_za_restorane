"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/Button";
import Input from "../components/Input";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [novaLozinka, setNovaLozinka] = useState("");
  const [potvrdaLozinke, setPotvrdaLozinke] = useState("");
  const [poruka, setPoruka] = useState("");
  const [greska, setGreska] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setGreska("");
    setPoruka("");

    if (!email || !novaLozinka || !potvrdaLozinke) {
      setGreska("Popunite sva polja");
      return;
    }

    if (novaLozinka !== potvrdaLozinke) {
      setGreska("Lozinke se ne poklapaju");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          novaLozinka,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGreska(data.error || "Greška pri promeni lozinke");
        return;
      }

      setPoruka("Lozinka je uspešno promenjena");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      setGreska("Greška na serveru");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-xl p-8">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">
          Zaboravljena lozinka
        </h1>

        <p className="text-zinc-500 mb-6">
          Unesite email i novu lozinku.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
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
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Nova lozinka
            </label>
            <Input
              type="password"
              placeholder="Unesite novu lozinku"
              value={novaLozinka}
              onChange={(e) => setNovaLozinka(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Potvrdite novu lozinku
            </label>
            <Input
              type="password"
              placeholder="Ponovo unesite lozinku"
              value={potvrdaLozinke}
              onChange={(e) => setPotvrdaLozinke(e.target.value)}
            />
          </div>
        </div>

        {greska && <p className="text-red-600 text-sm mt-4">{greska}</p>}
        {poruka && <p className="text-green-600 text-sm mt-4">{poruka}</p>}

        <div className="mt-6">
          <Button variant="success" onClick={handleReset}>
            {loading ? "Čuvanje..." : "Promeni lozinku"}
          </Button>
        </div>
      </div>
    </main>
  );
}