import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Pitch Time — Football Kickoff Tracker & Push Alerts",
  description:
    "Never miss kickoff. Real football fixtures for Champions League, Premier League, and La Liga auto-converted to your local timezone with instant browser alerts.",
  keywords: [
    "Pitch Time",
    "Football Match Tracker",
    "Kickoff Alerts",
    "Champions League",
    "Premier League",
    "La Liga",
    "Wise Style Football App",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#163300",
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
      <body className="min-h-full flex flex-col bg-white text-[#454745] selection:bg-[#9fe870] selection:text-[#163300]">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
