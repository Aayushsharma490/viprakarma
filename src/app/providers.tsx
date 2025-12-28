'use client';

import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Toaster } from "@/components/ui/sonner";
import CosmicBackground from "@/components/CosmicBackground";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
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
    );
}
