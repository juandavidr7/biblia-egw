import type { Metadata } from "next";
import { Crimson_Pro, Inter } from "next/font/google";
import "./globals.css";

const crimsonPro = Crimson_Pro({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Evangelios en Armonía · Mateo 20",
  description:
    "Plan de lectura bíblica en 4 días: Mateo 20 como guía central, complementado con los paralelos de Marcos, Lucas, y referencias a los escritos de Elena G. de White.",
  openGraph: {
    title: "Evangelios en Armonía · Mateo 20",
    description: "Lee los 4 evangelios en sincronía. Mateo como centro, con cada historia vista desde Marcos, Lucas y Juan.",
    locale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${crimsonPro.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
