"use client";

import Card from "./components/Card";
import Button from "./components/Button";

export default function Home() {
  const featuredRestaurants = [
    {
      id: 1,
      name: "Bojčinska koleba",
      desc: "Tradicionalni restoran",
      img: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/1c/b4/3f/photo0jpg.jpg?w=900&h=500&s=1",
    },
    {
      id: 2,
      name: "Trattoria Pepe",
      desc: "Italijanski restoran",
      img: "https://www.kudaveceras.rs/slike/offers/1615900736-restoran-trattoria-pepe-02.jpg",
    },
    {
      id: 3,
      name: "Mayka",
      desc: "Veganski restoran",
      img: "https://www.thebohoguide.com/wp-content/uploads/job-manager-uploads/main_image/2017/04/20170327_192711_resized.jpg",
    },
  ];

  const newRestaurants = [
    {
      id: 4,
      name: "Sentimenti",
      desc: "Italijanski restoran",
      img: "https://zadovoljna.nova.rs/wp-content/uploads/2025/11/03/1762171625-Senjak-3-1024x576.jpg",
    },
    {
      id: 5,
      name: "Muskat",
      desc: "Vinsko-restoranski lokal",
      img: "https://i2portal.rs/wp-content/uploads/2024/11/IMG_0427-768x1024.jpg",
    },
    {
      id: 6,
      name: "Delirium Silence",
      desc: "Molekularni restoran",
      img: "https://www.journal.rs/wp-content/uploads/2024/10/delirium-silence-molekularni-restoran-na-dorcolu-2.jpg",
    } 
  ];


  const trendingRestaurants = [
    {
      id: 7,
      name: "Buena Vida",
      desc: "Meksički restoran",
      img: "https://cdn.prod.website-files.com/61cf014bfba51e62fad747d1/61cf014bfba51e5664d74844_IMG_2358.jpg",
    },
    {
      id: 8,
      name: "Kalemegdanska terasa",
      desc: "Beogradski restoran",
      img: "https://promosto-images.s3.amazonaws.com/media/posts/26112021/kale1.jpg",
    },
    {
      id: 9,
      name: "Angry Monk",
      desc: "Japanski restoran",
      img: "https://www.rajicevashoppingcenter.rs/wp-content/uploads/2022/09/image00008-min.png",
    },
  ];

  
  const Section = ({ title, data }: { title: string; data: any[] }) => (
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
            <Button variant="success" onClick={() => alert(`Otvaram: ${r.name}`)}>
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
    </main>
  );
}