'use client';

import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from "@/components/ui/sonner";
import ParticleBackground from "@/components/ParticleBackground";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <AuthProvider>
                    <ParticleBackground />
                    <div className="relative z-10">
                        <ClientLayoutWrapper>
                            {children}
                        </ClientLayoutWrapper>
                    </div>
                    <Toaster richColors position="top-center" />
                </AuthProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}
