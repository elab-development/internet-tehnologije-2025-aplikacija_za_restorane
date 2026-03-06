"use client";

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
    <main style={{ padding: 24, maxWidth: 400 }}>
      <h1>Login</h1>

      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        type="password"
        placeholder="Lozinka"
        value={lozinka}
        onChange={(e) => setLozinka(e.target.value)}
      />

      {greska && (
        <p style={{ color: "red", marginTop: 12 }}>
          {greska}
        </p>
      )}

      <div style={{ marginTop: 16 }}>
        <Button variant="primary" onClick={handleLogin}>
          {loading ? "Prijavljivanje..." : "Prijavi se"}
        </Button>
      </div>
    </main>
  );
}