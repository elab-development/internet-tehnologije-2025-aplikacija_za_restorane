import { NextRequest, NextResponse } from "next/server";

type CachedResult = {
  lat: number;
  lng: number;
};

const geocodeCache = new Map<string, CachedResult>();

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Adresa je obavezna" },
      { status: 400 }
    );
  }

  const cacheKey = address.trim().toLowerCase();

  if (geocodeCache.has(cacheKey)) {
    return NextResponse.json(geocodeCache.get(cacheKey));
  }

  try {
    const url =
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(address)}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "restaurant-app-student-project/1.0",
        "Accept-Language": "sr",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Greška pri geokodiranju adrese" },
        { status: 502 }
      );
    }

    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "Koordinate nisu pronađene za ovu adresu" },
        { status: 404 }
      );
    }

    const result = {
      lat: Number(data[0].lat),
      lng: Number(data[0].lon),
    };

    geocodeCache.set(cacheKey, result);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}