import { Comic_Neue, Bubblegum_Sans } from "next/font/google";

export const comicNeue = Comic_Neue({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-comic-primary",
});

export const bubblegum = Bubblegum_Sans({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-comic-secondary",
});