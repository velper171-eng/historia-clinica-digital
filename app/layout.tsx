import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Historia Clínica Digital | Reliv Centro de Bienestar",
  description:
    "Gestión integral de historias clínicas para medicina estética: consentimientos, antecedentes y mapeo facial interactivo. Reliv Centro de Bienestar.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-blush text-stone antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
