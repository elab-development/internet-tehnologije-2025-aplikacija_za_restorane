"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type AuthUser = {
  id: number;
  uloga: "GUEST" | "MANAGER" | "ADMIN";
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [openManage, setOpenManage] = useState(false);

  useEffect(() => {
    async function loadMe() {
      try {
        setLoading(true);

        const res = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadMe();
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    setOpenManage(false);
    window.location.href = "/";
  }

  function leftNavClass(path: string) {
    return pathname === path
      ? "font-semibold text-green-600"
      : "text-gray-700 hover:text-green-600";
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex gap-6 items-center">
          <Link href="/" className={leftNavClass("/")}>
            Početna
          </Link>

          <Link href="/contact" className={leftNavClass("/contact")}>
            Kontakt
          </Link>
        </div>

        <div className="flex gap-4 items-center">
          {!loading && !user && (
            <>
              <Link
                href="/login"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Login
              </Link>

              <Link
                href="/register"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Register
              </Link>
            </>
          )}

          {!loading && user && (
            <>
              {user.uloga === "GUEST" && (
                <Link
                  href="/reservations/my"
                  className="font-medium text-gray-700 hover:text-green-600"
                >
                  Moje rezervacije
                </Link>
              )}

              {user.uloga === "MANAGER" && (
                <div className="relative">
                  <button
                    onClick={() => setOpenManage(!openManage)}
                    className="font-medium text-gray-700 hover:text-green-600"
                  >
                    Upravljanje restoranima ▾
                  </button>

                  {openManage && (
                    <div className="absolute right-0 mt-2 bg-white border rounded shadow-md w-56 z-50">
                      <Link
                        href="/restaurants/new"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Dodaj restoran
                      </Link>

                      <Link
                        href="/tables/new"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Upravljaj stolovima
                      </Link>

                      <Link
                        href="/manager/reservations"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                        Zahtevi za rezervaciju
                        </Link>
                    </div>
                  )}
                </div>
              )}

              {user.uloga === "ADMIN" && (
                <span className="font-medium text-gray-700">
                  Admin nalog
                </span>
              )}

              <button
                onClick={logout}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Odjavi se
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}