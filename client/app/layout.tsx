import type { Metadata } from "next";
import { fredoka, rubik } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arcki",
  description: "Beautiful architecture visualization with custom 3D modelling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fredoka.variable} ${rubik.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
