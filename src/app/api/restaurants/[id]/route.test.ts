import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    restaurant: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/guards", () => ({
  requireRole: vi.fn(),
}));

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/guards";
import { PUT, DELETE } from "./route";

describe("/api/restaurants/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("PUT vraca 400 za nevalidan id", async () => {
    vi.mocked(requireRole).mockResolvedValue({
      ok: true,
      auth: { userId: 1, role: "MANAGER" },
    } as any);

    const req = new Request("http://localhost/api/restaurants/abc", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        naziv: "Novi naziv",
        adresa: "Nova adresa",
        opis: "Opis",
        radnoVreme: "08-22",
      }),
    });

    const res = await PUT(req, {
      params: Promise.resolve({ id: "abc" }),
    });

    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Nevalidan id");
  });

  it("PUT vraca 403 kada manager pokusa da menja tudj restoran", async () => {
    vi.mocked(requireRole).mockResolvedValue({
      ok: true,
      auth: { userId: 1, role: "MANAGER" },
    } as any);

    vi.mocked(prisma.restaurant.findUnique).mockResolvedValue({
      id: 5,
      administratorId: 999,
    } as any);

    const req = new Request("http://localhost/api/restaurants/5", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        naziv: "Novi naziv",
        adresa: "Nova adresa",
        opis: "Opis",
        radnoVreme: "08-22",
      }),
    });

    const res = await PUT(req, {
      params: Promise.resolve({ id: "5" }),
    });

    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("Nemate dozvolu");
  });

  it("DELETE vraca 403 kada manager pokusa da obrise tudj restoran", async () => {
    vi.mocked(requireRole).mockResolvedValue({
      ok: true,
      auth: { userId: 1, role: "MANAGER" },
    } as any);

    vi.mocked(prisma.restaurant.findUnique).mockResolvedValue({
      id: 7,
      administratorId: 123,
    } as any);

    const req = new Request("http://localhost/api/restaurants/7", {
      method: "DELETE",
    });

    const res = await DELETE(req, {
      params: Promise.resolve({ id: "7" }),
    });

    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("Nemate dozvolu");
  });

  it("DELETE vraca 400 za nevalidan id", async () => {
    vi.mocked(requireRole).mockResolvedValue({
      ok: true,
      auth: { userId: 1, role: "MANAGER" },
    } as any);

    const req = new Request("http://localhost/api/restaurants/xyz", {
      method: "DELETE",
    });

    const res = await DELETE(req, {
      params: Promise.resolve({ id: "xyz" }),
    });

    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Nevalidan id");
  });
});