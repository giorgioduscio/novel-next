import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.sass";
import "bootstrap-icons/font/bootstrap-icons.css";
import Footer from "./shareds/footer";
import EditModeProviderWrapper from "./data/EditModeProviderWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <EditModeProviderWrapper>
          <div id="app">
            <div>{children}</div>
          </div>
        </EditModeProviderWrapper>
        <Footer />
      </body>
    </html>
  );
}
