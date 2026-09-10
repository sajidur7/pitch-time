import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "pitch time • Football Match Tracker & Push Alerts",
  description:
    "Explore upcoming club football matches across Champions League, Premier League, and La Liga. Converted to your local timezone with instant browser push notifications.",
  keywords: [
    "pitch time",
    "Football Match Tracker",
    "Kickoff Alerts",
    "Champions League",
    "Premier League",
    "La Liga",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#5433eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f2f4f5] text-[#000000] selection:bg-[#5433eb] selection:text-white">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
