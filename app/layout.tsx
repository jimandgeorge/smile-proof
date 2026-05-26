import type { Metadata, Viewport } from "next";
import { Inter_Tight, Inter } from "next/font/google";
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
  metadataBase: new URL('https://www.smileproof.co.uk'),
  title: "SmileProof — UK Dental Reviews",
  description: "Verified patient reviews and real prices for UK dental practices.",
  openGraph: {
    siteName: 'SmileProof',
    type: 'website',
    locale: 'en_GB',
    title: 'SmileProof — UK Dental Reviews',
    description: 'Verified patient reviews and real prices for UK dental practices.',
    url: 'https://www.smileproof.co.uk',
  },
  twitter: {
    card: 'summary',
    title: 'SmileProof — UK Dental Reviews',
    description: 'Verified patient reviews and real prices for UK dental practices.',
  },
  alternates: {
    canonical: 'https://www.smileproof.co.uk',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${interTight.variable} ${inter.variable} h-full antialiased`}>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-2W1RGM0DQ1" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-2W1RGM0DQ1');
        `}} />
      </head>
      <body className="min-h-full flex flex-col font-body" suppressHydrationWarning>
        <NavBar />
        <div className="flex-1">{children}</div>
        <ConditionalFooter />
      </body>
    </html>
  );
}
