import type { Metadata, Viewport } from "next";
import { Inter_Tight, Inter } from "next/font/google";
import Script from "next/script";
import NavBar from "./components/NavBar";
import ConditionalFooter from "./components/ConditionalFooter";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "SmileProof — UK Dental Reviews",
  description: "Verified patient reviews and real prices for UK dental practices.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${interTight.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-body" suppressHydrationWarning>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-YHLN26L0HJ" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-YHLN26L0HJ');
        `}</Script>
        <NavBar />
        <div className="flex-1">{children}</div>
        <ConditionalFooter />
      </body>
    </html>
  );
}
