"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../../components/Button";
import Input from "../../components/Input";

export default function NewRestaurantPage() {
  const router = useRouter();

  const [naziv, setNaziv] = useState("");
  const [adresa, setAdresa] = useState("");
  const [opis, setOpis] = useState("");
  const [radnoVreme, setRadnoVreme] = useState("");
  const [greska, setGreska] = useState("");
  const [uspeh, setUspeh] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateRestaurant() {
    setGreska("");
    setUspeh("");

    if (!naziv || !adresa || !radnoVreme) {
      setGreska("Unesite naziv, adresu i radno vreme");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          naziv,
          adresa,
          opis,
          radnoVreme,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGreska(data.error || "Greška pri kreiranju restorana");
        return;
      }

      setUspeh("Restoran je uspešno dodat.");

      setNaziv("");
      setAdresa("");
      setOpis("");
      setRadnoVreme("");

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1000);
    } catch {
      setGreska("Greška na serveru");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 500 }}>
      <h1>Dodavanje restorana</h1>

      <Input
        type="text"
        placeholder="Naziv restorana"
        value={naziv}
        onChange={(e) => setNaziv(e.target.value)}
      />

      <Input
        type="text"
        placeholder="Adresa"
        value={adresa}
        onChange={(e) => setAdresa(e.target.value)}
      />

      <div style={{ marginTop: 12 }}>
        <textarea
          placeholder="Opis restorana"
          value={opis}
          onChange={(e) => setOpis(e.target.value)}
          rows={5}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            resize: "vertical",
          }}
        />
      </div>

      <Input
        type="text"
        placeholder="Radno vreme (npr. 09:00-23:00)"
        value={radnoVreme}
        onChange={(e) => setRadnoVreme(e.target.value)}
      />

      {greska && (
        <p style={{ color: "red", marginTop: 12 }}>
          {greska}
        </p>
      )}

      {uspeh && (
        <p style={{ color: "green", marginTop: 12 }}>
          {uspeh}
        </p>
      )}

      <div style={{ marginTop: 16 }}>
        <Button variant="primary" onClick={handleCreateRestaurant}>
          {loading ? "Dodavanje..." : "Dodaj restoran"}
        </Button>
      </div>
    </main>
  );
}