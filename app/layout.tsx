import type { Metadata } from "next";
import { DM_Serif_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const serif = DM_Serif_Display({ subsets: ["latin"], weight: ["400"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Wedding AI Builder",
  description: "Générez un plan de mariage personnalisé en moins de 5 minutes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${sans.variable} ${serif.variable}`}>{children}</body>
    </html>
  );
}
