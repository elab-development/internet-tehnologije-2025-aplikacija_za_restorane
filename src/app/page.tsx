"use client";
import Button from "./components/Button";

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Početna strana</h1>

      <Button
        variant="primary"
        onClick={() => alert("Klik sa Home stranice")}
      >
        Primary dugme
      </Button>

      <br /><br />

      <Button
        variant="secondary"
        onClick={() => alert("Drugo dugme")}
      >
        Secondary dugme
      </Button>
    </main>
  );
}


