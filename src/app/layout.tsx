import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Pitch Time — Club Football Match Tracker & Kickoff Notifications",
  description:
    "Never miss kickoff. Matches auto-converted to your local time with instant 10-minute browser alerts. Covering UEFA Champions League, Premier League, and La Liga.",
  keywords: [
    "Football",
    "Soccer",
    "Match Tracker",
    "Kickoff Time",
    "Champions League",
    "Premier League",
    "La Liga",
    "Timezone Football",
    "Kickoff Alerts",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
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
      <body className="min-h-full flex flex-col bg-[#ffffff] text-[#000000] selection:bg-black selection:text-white">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
