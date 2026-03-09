import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/ui/Navbar";
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "ProPilates – Web3 Pilates Instructor Platform",
  description:
    "Build, teach, and monetize Pilates classes on XION blockchain with gasless auth, marketplace, and Spotify integration.",
  keywords: ["pilates", "instructor", "web3", "xion", "blockchain", "fitness"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} font-sans`}>
        <Providers>
          <Navbar />
          <main className="min-h-screen pt-16 pb-20 md:pb-0">{children}</main>
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
