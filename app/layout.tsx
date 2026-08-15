import type { Metadata } from "next";
import "./globals.sass";
import "bootstrap-icons/font/bootstrap-icons.css";
import { AgreeProvider } from "./shareds/Agree";
import { bubblegum, comicNeue } from "./styles/fonts";
import BottomFooter from "./shareds/BottomFooter";


export const metadata: Metadata = {
  title: "Novel",
  description: "A novel reader app",
  icons: {
    icon: "/racoon-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${comicNeue.variable} ${bubblegum .variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no"/>
      </head>
      <body className="flex flex-col min-h-screen">
        <AgreeProvider>
          <div id="app" className="flex-1">
            <div>{children}</div>
          </div>
        </AgreeProvider>

        <BottomFooter />
      </body>
    </html>
  );
}
