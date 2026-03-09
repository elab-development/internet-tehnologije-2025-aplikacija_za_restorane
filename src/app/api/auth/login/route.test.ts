import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  signToken: vi.fn(),
}));

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { POST } from "./route";

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("vraca 400 ako email ili lozinka nedostaju", async () => {
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "", lozinka: "" }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Obavezno: email, lozinka");
  });

  it("vraca 401 ako korisnik ne postoji", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@test.com",
        lozinka: "pogresna",
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(prisma.user.findUnique).toHaveBeenCalled();
    expect(res.status).toBe(401);
    expect(data.error).toBe("Pogrešan email ili lozinka");
  });

  it("vraca 401 ako lozinka nije dobra", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 1,
      ime: "Milica",
      email: "test@test.com",
      uloga: "MANAGER",
      lozinka: "hashed-password",
    } as any);

    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@test.com",
        lozinka: "pogresna",
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Pogrešan email ili lozinka");
  });

  it("vraca 200 za ispravan login", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 1,
      ime: "Milica",
      email: "test@test.com",
      uloga: "MANAGER",
      lozinka: "hashed-password",
    } as any);

    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(signToken).mockReturnValue("test-jwt-token" as never);

    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@test.com",
        lozinka: "dobra-lozinka",
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.id).toBe(1);
    expect(data.email).toBe("test@test.com");
    expect(data.uloga).toBe("MANAGER");
  });
});