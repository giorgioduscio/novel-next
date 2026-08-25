import type { Metadata, Viewport } from "next";
import "./globals.sass";
import "bootstrap-icons/font/bootstrap-icons.css";
import { AppProviders } from "./data/AppProviders";
import { bubblegum, comicNeue } from "./styles/fonts";
import BottomFooter from "./shareds/BottomFooter";
import Bottombar from "./shareds/Bottombar";
import { KeyboardEventHandler } from "react";


export const metadata: Metadata = {
  title: "Novel",
  description: "A novel reader app",
  icons: {
    icon: "/racoon-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: 
  Readonly<{ children: React.ReactNode }>
) {
  
  return (
    <html lang="en" className={`${comicNeue.variable} ${bubblegum.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
      </head>
      <body className="bg-gray-600">
        <AppProviders>
          <div id="app" className="text-white min-h-dvh">
            {children}
          </div>

          <BottomFooter />
          <Bottombar />
        </AppProviders>
      </body>
    </html>
  );
}
