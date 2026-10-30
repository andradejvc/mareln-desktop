import type { Metadata } from "next";
import { Cherry_Cream_Soda, Elsie, Playfair_Display } from "next/font/google";
import "./globals.css";

const cherry = Cherry_Cream_Soda({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-cherry",
});

const elsie = Elsie({
  subsets: ["latin"],
  weight: ["400", "900"],
  variable: "--font-elsie",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Maré LN",
  description: "Descubra e viva todos os eventos gratuitos do litoral norte de SP.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${cherry.variable} ${elsie.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}