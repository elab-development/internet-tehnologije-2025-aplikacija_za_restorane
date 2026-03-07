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
    <main style={{ padding: 24, maxWidth: 400 }}>
      <h1>Registracija</h1>

      <Input
        type="text"
        placeholder="Ime"
        value={ime}
        onChange={(e) => setIme(e.target.value)}
      />

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

      <div style={{ marginTop: 12 }}>
        <label
          htmlFor="uloga"
          style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
        >
          Uloga
        </label>

        <select
          id="uloga"
          value={uloga}
          onChange={(e) => setUloga(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            color: "#000000"
          }}
        >
          <option value="GUEST">Guest</option>
          <option value="MANAGER">Manager</option>
        </select>
      </div>

      {greska && (
        <p style={{ color: "red", marginTop: 12 }}>
          {greska}
        </p>
      )}

      <div style={{ marginTop: 16 }}>
        <Button variant="primary" onClick={handleRegister}>
          {loading ? "Registracija..." : "Registruj se"}
        </Button>
      </div>
    </main>
  );
}