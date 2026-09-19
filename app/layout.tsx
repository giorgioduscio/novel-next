import type { Metadata, Viewport } from "next";
import "./globals.sass";
import "bootstrap-icons/font/bootstrap-icons.css";
import { AppProviders } from "./data/AppProviders";
import { bubblegum, comicNeue } from "./styles/fonts";
import MainContent from "./shareds/MainContent";


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
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: 
  Readonly<{ children: React.ReactNode }>
) {
  
  return (
    <html lang="it" className={`${comicNeue.variable} ${bubblegum.variable}`}>
      <body className="bg-gray-600 flex flex-col h-[100dvh] overflow-hidden">
        <AppProviders>
          <div id="app" className="text-white flex-1 overflow-y-auto mt-[50px]">
            <MainContent>{children}</MainContent>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
