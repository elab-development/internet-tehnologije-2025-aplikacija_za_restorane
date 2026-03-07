"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { restaurants } from "@/lib/restaurants";

export default function RestaurantDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const restaurantId = Number(params.id);
  const restaurant = restaurants.find((r) => r.id === restaurantId);

  if (!restaurant) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-4">Restoran nije pronađen</h1>
        <Link href="/" className="text-green-700 underline">
          Nazad na početnu
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <button
        onClick={() => router.back()}
        className="mb-6 border px-4 py-2 rounded-xl"
      >
        Nazad
      </button>

      <div className="border rounded-2xl overflow-hidden shadow-sm">
        <img
          src={restaurant.img}
          alt={restaurant.name}
          className="w-full h-[420px] object-cover"
        />

        <div className="p-6">
          <h1 className="text-4xl font-bold mb-4">{restaurant.name}</h1>
          <p className="text-lg text-gray-700 mb-6">{restaurant.about}</p>

          <div className="space-y-2 mb-8">
            <p><span className="font-semibold">Adresa:</span> {restaurant.address}</p>
            <p><span className="font-semibold">Radno vreme:</span> {restaurant.workingHours}</p>
            <p><span className="font-semibold">Telefon:</span> {restaurant.phone}</p>
            <p><span className="font-semibold">Ocena:</span> {restaurant.review}/5</p>
            <p><span className="font-semibold">Grad:</span> {restaurant.city}</p>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Meni</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {restaurant.menu.map((item) => (
              <div key={item.id} className="border rounded-xl p-4">
                <p className="font-semibold">{item.name}</p>
                <p className="text-gray-600">{item.price} RSD</p>
                <p className="text-sm text-gray-500">{item.tags.join(", ")}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push(`/reservation/${restaurant.id}`)}
            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition"
          >
            Rezerviši sto
          </button>
        </div>
      </div>
    </main>
  );
}