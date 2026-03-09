"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

type Restaurant = {
  id: number;
  naziv: string;
  adresa: string;
};

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

export default function RestaurantsMap() {
  const [restaurants, setRestaurants] = useState<RestaurantWithCoords[]>([]);
  const [loading, setLoading] = useState(true);
  const [greska, setGreska] = useState("");

  useEffect(() => {
    async function loadMapData() {
      try {
        setLoading(true);
        setGreska("");

        const res = await fetch("/api/map-restaurants", {
          credentials: "include",
          cache: "no-store",
        });

        const baseRestaurants: Restaurant[] = await res.json();

        if (!res.ok) {
          setGreska("Greška pri učitavanju restorana za mapu.");
          return;
        }

        const withCoords: RestaurantWithCoords[] = [];

        // Sekvencijalno, da ne šaljemo previše zahteva odjednom
        for (const restaurant of baseRestaurants) {
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

            // javni Nominatim servis traži veoma umerenu upotrebu
            await sleep(1100);
          } catch {
            // preskoči restoran ako geocoding ne uspe
          }
        }

        setRestaurants(withCoords);
      } catch {
        setGreska("Greška na serveru.");
      } finally {
        setLoading(false);
      }
    }

    loadMapData();
  }, []);

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
        Lokacije restorana
      </h2>

      {loading && <p>Učitavanje mape...</p>}

      {greska && <p className="text-red-600">{greska}</p>}

      {!loading && !greska && restaurants.length === 0 && (
        <p className="text-zinc-600">
          Trenutno nema restorana za prikaz na mapi.
        </p>
      )}

      {!loading && !greska && restaurants.length > 0 && (
        <MapInner restaurants={restaurants} />
      )}
    </section>
  );
}