"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    if (!email || !password) {
      alert("Unesite email i lozinku");
      return;
    }
    alert("Uspešna prijava (demo)");
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginTop: 12, padding: 8 }}
      />

      <input
        type="password"
        placeholder="Lozinka"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginTop: 12, padding: 8 }}
      />

      <button onClick={handleLogin} style={{ marginTop: 16 }}>
        Prijavi se
      </button>
    </main>
  );
}

