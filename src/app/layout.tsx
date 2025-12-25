import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from "@/components/ui/sonner";
import CosmicBackground from "@/components/CosmicBackground";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

export const metadata: Metadata = {
  title: "Viprakarma - Complete Astrology & Spiritual Services",
  description:
    "Discover your cosmic blueprint with Viprakarma. Get personalized Kundali, numerology, palmistry, puja services, and connect with expert pandits and astrologers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22/>"
        />
      </head>
      <body className="antialiased font-serif bg-[#050510] text-[#f0f0f5]" suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <CosmicBackground />
              <div className="relative z-10">
                <ClientLayoutWrapper>
                  {children}
                </ClientLayoutWrapper>
              </div>
              <Toaster richColors position="top-center" />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
