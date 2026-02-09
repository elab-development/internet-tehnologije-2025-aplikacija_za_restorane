"use client";

import { useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";

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
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div style={{ marginTop: 16 }}>
        <Button variant="primary" onClick={handleLogin}>
          Prijavi se
        </Button>
      </div>
    </main>
  );
}
