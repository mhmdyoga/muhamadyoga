import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { LenisProvider } from "@/components/Providers/Lenis";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


const SITE_URL = "https://muhamadyoga.vercel.app"; // ganti dengan URL produksimu

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Muhamad Yoga Cahaya Pratama — Software Developer",
    template: "%s | Yoga Cahaya Pratama",
  },
  description:
    "Portofolio Muhamad Yoga Cahaya Pratama: proyek web, teknologi yang dipakai, dan cara menghubungi.",
  authors: [{ name: "Muhamad Yoga Cahaya Pratama", url: SITE_URL }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Yoga Cahaya Pratama",
    title: "Muhamad Yoga Cahaya Pratama — Software Developer",
    description: "Portofolio proyek web dan pengalaman.",
    locale: "id_ID",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  verification: { google: "KODE_DARI_SEARCH_CONSOLE" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <meta name="google-site-verification" content="fsB-ccS3HtxpR0TU_e2NPTVqJoxVujNwSJNjQ-A13YY" />
      <LenisProvider>
         <body className="">
        {children}
        <Toaster/>
      </body>
     
      </LenisProvider>
    </html>
  );
}
