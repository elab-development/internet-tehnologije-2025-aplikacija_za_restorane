export type MenuItem = {
  id: number;
  name: string;
  price: number;
  tags: string[];
};

export type Restaurant = {
  id: number;
  name: string;
  desc: string;
  img: string;
  type: string;
  address: string;
  workingHours: string;
  phone: string;
  review: number;
  about: string;
  city: string;
  menu: MenuItem[];
};

export const restaurants: Restaurant[] = [
  {
    id: 1,
    name: "Bojčinska koleba",
    desc: "Tradicionalni restoran",
    img: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/1c/b4/3f/photo0jpg.jpg?w=900",
    type: "Tradicionalni",
    address: "Surčinska 1, Beograd",
    workingHours: "09:00–22:00",
    phone: "011 123456",
    review: 4.7,
    city: "Beograd",
    about: "Restoran u prirodi sa domaćom kuhinjom i opuštenom atmosferom.",
    menu: [
      { id: 1, name: "Karađorđeva šnicla", price: 950, tags: ["meso"] },
      { id: 2, name: "Šopska salata", price: 350, tags: ["vegetarijansko"] },
      { id: 3, name: "Pasulj", price: 500, tags: ["vegetarijansko"] },
    ],
  },
  {
    id: 2,
    name: "Trattoria Pepe",
    desc: "Italijanski restoran",
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop",
    type: "Italijanski",
    address: "Gospodar Jovanova 33, Beograd",
    workingHours: "09:00–23:00",
    phone: "011 3285295",
    review: 4.6,
    city: "Beograd",
    about: "Ušuškana italijanska atmosfera, sjajna pasta i pizza.",
    menu: [
      { id: 1, name: "Pizza Margherita", price: 900, tags: ["vegetarijansko"] },
      { id: 2, name: "Pasta Carbonara", price: 1100, tags: ["meso"] },
      { id: 3, name: "Risotto Funghi", price: 1050, tags: ["vegetarijansko"] },
    ],
  },
  {
    id: 3,
    name: "Mayka",
    desc: "Veganski restoran",
    img: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200&auto=format&fit=crop",
    type: "Veganski",
    address: "Cara Dušana 12, Novi Sad",
    workingHours: "10:00–22:00",
    phone: "021 555444",
    review: 4.8,
    city: "Novi Sad",
    about: "Savremena veganska kuhinja i zdravi obroci.",
    menu: [
      { id: 1, name: "Vegan burger", price: 890, tags: ["vegansko"] },
      { id: 2, name: "Tofu salata", price: 760, tags: ["vegansko", "bez glutena"] },
      { id: 3, name: "Humus platter", price: 650, tags: ["vegansko"] },
    ],
  },
];