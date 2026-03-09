export default function ContactPage() {
  return (
    <main className="p-6 min-h-screen bg-zinc-50 text-zinc-900">
      <h1 className="text-3xl font-bold mb-4">Kontakt</h1>

      <p className="text-zinc-700">
        Za sva pitanja u vezi rezervacija možete nas kontaktirati putem sledećih kanala:
      </p>

      <ul className="mt-4 space-y-1">
        <li>
          <b>Email:</b> podrska@restoran-app.com
        </li>
        <li>
          <b>Telefon:</b> +381 60 123 456
        </li>
        <li>
          <b>Radno vreme podrške:</b> 09:00 – 18:00
        </li>
      </ul>
    </main>
  );
}



