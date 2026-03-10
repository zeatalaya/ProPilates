import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/ui/Navbar";
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";
import { SpotifyPlayerProvider } from "@/components/spotify/SpotifyPlayerProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "ProPilates – Professional Pilates Platform",
  description:
    "Build, teach, and monetize Pilates classes with marketplace, credential verification, and Spotify integration.",
  keywords: ["pilates", "instructor", "fitness", "marketplace", "certification"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrains.variable} font-sans`}>
        <Providers>
          <ThemeProvider>
          <SpotifyPlayerProvider>
            <Navbar />
            <main className="min-h-screen pt-16 pb-20 md:pb-0">{children}</main>
            <MobileBottomNav />
          </SpotifyPlayerProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
