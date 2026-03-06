import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Restoran App",
  description: "Aplikacija za rezervaciju stolova u restoranima",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <nav className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between">
            <h1 className="font-bold text-lg">Restoran App</h1>

            <div className="flex gap-4">
              <a href="/" className="hover:text-green-600">Home</a>
              <a href="/contact" className="hover:text-green-600">Kontakt</a>
              <a href="/login" className="hover:text-green-600">Login</a>
            </div>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}