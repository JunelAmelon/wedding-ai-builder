import type { Metadata } from "next";
import { Inter, Space_Grotesk, Poppins } from "next/font/google";
import "./globals.css";
import { QuizRouteGuard } from "@/components/QuizRouteGuard";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const serif = Space_Grotesk({ subsets: ["latin"], variable: "--font-serif" });
const poppins = Poppins({ subsets: ["latin"], weight: "700", variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "MariageFacile",
  description: "Générez un plan de mariage personnalisé en moins de 5 minutes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${sans.variable} ${display.variable} ${serif.variable} ${poppins.variable}`}>
        <QuizRouteGuard>{children}</QuizRouteGuard>
      </body>
    </html>
  );
}
