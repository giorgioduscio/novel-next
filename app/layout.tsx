import type { Metadata } from "next";
import "./globals.sass";
import "bootstrap-icons/font/bootstrap-icons.css";
import Footer from "./shareds/Footer";
import { AgreeProvider } from "./shareds/Agree";
import { bubblegum, comicNeue } from "./styles/fonts";


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
      <body>
        <AgreeProvider>
          <div id="app">
            <div>{children}</div>
          </div>
        </AgreeProvider>

        <Footer />
      </body>
    </html>
  );
}
