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
  title: "pitch time. — Club Football Match Tracker",
  description:
    "A clean notebook for tracking upcoming club football matches across UEFA Champions League, Premier League, and La Liga. Auto-converted to your local timezone with 10-minute alerts.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0075de",
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
      <body className="min-h-full flex flex-col bg-[#f6f5f4] text-[#000000] selection:bg-[#e6f3fe] selection:text-[#0075de]">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
