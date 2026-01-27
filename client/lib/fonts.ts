import { Inter, Playfair_Display } from "next/font/google";

// Clean font for body text and UI
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Elegant serif for headlines and accents
export const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});
