"use client";
import { useState } from "react";

import Modal from "./components/Modal";
import Card from "./components/Card";
import Button from "./components/Button";

type Restaurant = {
  id: number;
  name: string;
  desc: string;
  img: string;


  adresa: string;
  workingHours: string;
  phone: string;
  about: string;

  recenzija: string;
};

export default function Home() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Restaurant | null>(null);

  const featuredRestaurants: Restaurant[] = [
    {
      id: 1,
      name: "Bojčinska koleba",
      desc: "Tradicionalni restoran",
      img: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/1c/b4/3f/photo0jpg.jpg?w=900&h=500&s=1",
      adresa: "Vlade Obradovića Kamenog bb, Progar",
      workingHours: "08:00–00:00",
      phone: "+381 65 8427 505",
      about:
         "Restoran u prirodnom ambijentu Bojčinske šume, idealan za uživanje i porodična okupljanja.",
      recenzija: "4.7/5",
    },
    {
      id: 2,
      name: "Trattoria Pepe",
      desc: "Italijanski restoran",
      img: "https://www.kudaveceras.rs/slike/offers/1615900736-restoran-trattoria-pepe-02.jpg",
      adresa: "Gospodar Jovanova 33, Beograd",
      workingHours: "09:00–23:00",
      phone: "011 3285295",
      about:
        "Ušuškana italijanska atmosfera, sjajna pasta i pizza. Idealno za večernji izlazak.",
      recenzija: "4.6/5",
    },
    {
      id: 3,
      name: "Mayka",
      desc: "Veganski restoran",
      img: "https://www.thebohoguide.com/wp-content/uploads/job-manager-uploads/main_image/2017/04/20170327_192711_resized.jpg",
      adresa: "Nikole Spasića 5, Beograd",
      workingHours: "13:00–23:00",
      phone: "+381 63 8123 630",
      about:
        "Zdravija ponuda sa vegeterijanskim i veganskim opcijama, lagani obroci i prijatan ambijent.",
      recenzija: "4.4/5",
    },
  ];

  const trendingRestaurants: Restaurant[] = [
    {
      id: 7,
      name: "Buena Vida",
      desc: "Meksički restoran",
      img: "https://cdn.prod.website-files.com/61cf014bfba51e62fad747d1/61cf014bfba51e5664d74844_IMG_2358.jpg",
      adresa: "Bulevar Milutina Milankovića, Novi Beograd",
      workingHours: "12:00–00:00",
      phone: "011 6903311",
      about:
        "Živahan ambijent i začinjeni ukusi, super za druženje.",
      recenzija: "4.5/5",
    },
    {
      id: 8,
      name: "Kalemegdanska terasa",
      desc: "Beogradski restoran",
      img: "https://promosto-images.s3.amazonaws.com/media/posts/26112021/kale1.jpg",
      adresa: "Mali Kalemegdan bb, Beograd",
      workingHours: "12:00–23:00",
      phone: "011 3282727",
      about:
        "Pogled i atmosfera za posebne prilike. Odličan izbor za večeru i događaje.",
      recenzija: "4.5/5"
    },
    {
      id: 9,
      name: "Angry Monk",
      desc: "Japanski restoran",
      img: "https://www.rajicevashoppingcenter.rs/wp-content/uploads/2022/09/image00008-min.png",
      adresa: " Uzun Mirkova 11, Stari Grad",
      workingHours: "11:00–23:00",
      phone: "*381 64 6123 123",
      about:
        "Sushi i japanski specijaliteti u modernom ambijentu – brzo i ukusno.",
      recenzija: "4.6/5",
    },
  ];

  const newRestaurants: Restaurant[] = [
    {
      id: 4,
      name: "Sentimenti",
      desc: "Italijanski restoran",
      img: "https://zadovoljna.nova.rs/wp-content/uploads/2025/11/03/1762171625-Senjak-3-1024x576.jpg",
      adresa: "Cara Lazara 5-7, Beograd",
      workingHours: "10:00–23:00",
      phone: "+381 65 3195 429",
      about:
        "Elegantan enterijer i klasični italijanski ukusi. Odličan za mirniju večeru.",
      recenzija: "4.7/5",
    },
    {
      id: 5,
      name: "Muskat",
      desc: "Vinsko-restoranski lokal",
      img: "https://i2portal.rs/wp-content/uploads/2024/11/IMG_0427-768x1024.jpg",
      adresa: "Čede Mijatovića 8, Beograd",
      workingHours: "12:00–00:00",
      phone: "+381 11 303 404",
      about:
        "Fokus na vinu i laganim jelima – idealno za degustaciju i opuštanje.",
      recenzija: "4.5/5",
    },
    {
      id: 6,
      name: "Delirium Silence",
      desc: "Molekularni restoran",
      img: "https://www.journal.rs/wp-content/uploads/2024/10/delirium-silence-molekularni-restoran-na-dorcolu-2.jpg",
      adresa: "Strahinjića Bana 10, Dorćol, Beograd",
      workingHours: "18:00–23:00",
      phone: "+381 65 8016 196",
      about:
        "Moderni koncept i drugačiji tanjiri – za one koji vole novo iskustvo.",
      recenzija: "4.3/5",
    },
  ];

  const Section = ({ title, data }: { title: string; data: Restaurant[] }) => (
    <section style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: 22, marginBottom: 12 }}>{title}</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 18,
        }}
      >
        {data.map((r) => (
          <Card key={r.id} title={r.name} description={r.desc} imageUrl={r.img}>
            <Button
              variant="success"
              onClick={() => {
                setSelected(r);
                setOpen(true);
              }}
            >
              Detalji
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>Restorani u ponudi</h1>
      <p style={{ color: "#555", marginBottom: 18 }}>
        Izaberi restoran i klikni “Detalji” za više informacija.
      </p>

      <Section title="Preporučujemo" data={featuredRestaurants} />
      <Section title="Restorani u trendu" data={trendingRestaurants} />
      <Section title="Novi restorani" data={newRestaurants} />

      <Modal
        isOpen={open}
        title={selected?.name || "Detalji"}
        onClose={() => setOpen(false)}
      >
        {selected && (
          <>
            <img
              src={selected.img}
              alt={selected.name}
              style={{
                width: "100%",
                height: 220,
                objectFit: "cover",
                borderRadius: 10,
                display: "block",
              }}
            />

            <p style={{ marginTop: 12, fontSize: 16 }}>{selected.about}</p>

            <div style={{ marginTop: 12, lineHeight: 1.8 }}>
              <div>
                <b>Adresa:</b> {selected.adresa}
              </div>
              <div>
                <b>Radno vreme:</b> {selected.workingHours}
              </div>
              <div>
                <b>Telefon:</b> {selected.phone}
              </div>
              <div>
                <b>Recenzija:</b> {selected.recenzija}
              </div>
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <Button
                variant="success"
                onClick={() => alert("Rezervacija (kasnije)")}
              >
                Rezerviši sto
              </Button>
            </div>
          </>
        )}
      </Modal>
    </main>
  );
}
