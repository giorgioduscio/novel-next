import type { Metadata, Viewport } from "next";
import "./globals.sass";
import "bootstrap-icons/font/bootstrap-icons.css";
import { AppProviders } from "./data/AppProviders";
import { bubblegum, comicNeue } from "./styles/fonts";
import BottomFooter from "./shareds/BottomFooter";


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
      <body className="flex flex-col min-h-dvh bg-gray-600">
        <AppProviders>
          <div id="app" className="text-white flex-1 flex flex-col min-h-dvh">
            {children}
          </div>
        </AppProviders>

        <BottomFooter />
      </body>
    </html>
  );
}
