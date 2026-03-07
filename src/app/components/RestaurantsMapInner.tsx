"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

type RestaurantWithCoords = {
  id: number;
  naziv: string;
  adresa: string;
  lat: number;
  lng: number;
};

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function RestaurantsMapInner({
  restaurants,
}: {
  restaurants: RestaurantWithCoords[];
}) {
  const center: [number, number] =
    restaurants.length > 0
      ? [restaurants[0].lat, restaurants[0].lng]
      : [44.8176, 20.4633];

  return (
    <div style={{height: "380px", maxWidth: "900px", margin: "40px auto", borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.1)"}}>
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.lat, restaurant.lng]}
            icon={markerIcon}
          >
            <Popup>
              <b>{restaurant.naziv}</b>
              <br />
              {restaurant.adresa}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}