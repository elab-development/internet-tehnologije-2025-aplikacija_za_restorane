"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

type Restaurant = {
  id: number;
  naziv: string;
  adresa: string;
  administratorId?: number;
};

type AuthUser = {
  id: number;
  uloga: "GUEST" | "MANAGER" | "ADMIN";
} | null;

type RestaurantWithCoords = Restaurant & {
  lat: number;
  lng: number;
};

const MapInner = dynamic(() => import("./RestaurantsMapInner"), {
  ssr: false,
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function RestaurantsMap({
  restaurants,
}: {
  restaurants: Restaurant[];
  user?: AuthUser;
}) {
  const [restaurantsWithCoords, setRestaurantsWithCoords] = useState<
    RestaurantWithCoords[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [greska, setGreska] = useState("");

  useEffect(() => {
    async function loadMapData() {
      try {
        setLoading(true);
        setGreska("");

        const withCoords: RestaurantWithCoords[] = [];

        for (const restaurant of restaurants) {
          try {
            const geoRes = await fetch(
              `/api/geocode?address=${encodeURIComponent(restaurant.adresa)}`,
              {
                credentials: "include",
                cache: "no-store",
              }
            );

            const geoData = await geoRes.json();

            if (geoRes.ok) {
              withCoords.push({
                ...restaurant,
                lat: geoData.lat,
                lng: geoData.lng,
              });
            }

            await sleep(1100);
          } catch {
            // preskoči ako geocoding ne uspe
          }
        }

        setRestaurantsWithCoords(withCoords);
      } catch {
        setGreska("Greška na serveru.");
      } finally {
        setLoading(false);
      }
    }

    loadMapData();
  }, [restaurants]);

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
        Lokacije restorana
      </h2>

      {loading && <p>Učitavanje mape...</p>}
      {greska && <p className="text-red-600">{greska}</p>}

      {!loading && !greska && restaurantsWithCoords.length === 0 && (
        <p className="text-zinc-600">
          Trenutno nema restorana za prikaz na mapi.
        </p>
      )}

      {!loading && !greska && restaurantsWithCoords.length > 0 && (
        <div
          style={{
            height: "380px",
            maxWidth: "900px",
            margin: "40px auto",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <MapInner restaurants={restaurantsWithCoords} />
        </div>
      )}
    </section>
  );
}