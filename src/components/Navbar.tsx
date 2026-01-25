"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Menu,
  X,
  User,
  LogOut,
  Shield,
  Moon,
  Sun,
  Languages,
  Star,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import NotificationBell from "@/components/NotificationBell";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";

interface NavbarProps {
  kundaliData?: any;
  onDownloadPDF?: () => void;
}

export default function Navbar({ kundaliData, onDownloadPDF }: NavbarProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, logout, adminLogout, isAdminLoggedIn } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    if (isAdminLoggedIn) {
      adminLogout();
    } else {
      logout();
    }
  };

  const navLinks = [
    { href: "/kundali", label: t("nav.kundali") },
    { href: "/kundali-matching", label: t("nav.kundaliMatching") },
    { href: "/numerology", label: t("nav.numerology") },
    { href: "/palmistry", label: t("nav.palmistry") },
    { href: "/talk-to-astrologer", label: t("nav.talkToAstrologer") },
    { href: "/mahurat", label: t("nav.mahurat") },
    { href: "/pooja-booking", label: t("nav.poojaBooking") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <>
      <nav className="bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-50 shadow-2xl transition-colors duration-500">
        <div className="container mx-auto px-2 md:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 md:gap-2 shrink-0 group">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[#FFD700] group-hover:scale-110 transition-transform duration-500" />
              <span className="text-xl md:text-2xl font-black golden-text tracking-tighter uppercase font-sans">
                Viprakarma
              </span>
            </Link>
            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-0 xl:gap-0.5">
              <div className="flex items-center">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-all duration-300 font-bold px-1.5 xl:px-2 py-2 rounded-md hover:bg-accent/10 text-[10px] xl:text-[12px] uppercase tracking-tighter xl:tracking-wider font-sans relative group"
                  >
                    {link.label}
                    <span className="absolute bottom-1 left-1.5 right-1.5 h-[1px] bg-[#FFD700] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  </Link>
                ))}
              </div>

              <div className="w-px h-6 bg-border mx-1 xl:mx-2"></div>

              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                  className="text-muted-foreground hover:text-primary hover:bg-accent/10 h-8 w-8 transition-colors"
                >
                  {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleLanguage}
                  title={`Switch to ${language === "en" ? "Hindi" : "English"}`}
                  className="text-muted-foreground hover:text-primary hover:bg-accent/10 h-8 w-8 transition-colors"
                >
                  <Languages className="w-4 h-4" />
                  <span className="ml-1 text-[0.65rem] font-black uppercase">{language}</span>
                </Button>
              </div>

              <div className="flex items-center gap-1.5 xl:gap-2 ml-1 xl:ml-2">
                {user ? (
                  <>
                    <NotificationBell />
                    <Link href="/profile">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground hover:bg-accent/10 text-[12px] h-8 px-2 xl:px-3 font-bold uppercase tracking-wider transition-colors"
                      >
                        {t("nav.profile")}
                      </Button>
                    </Link>
                    <Link href="/subscription">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20 text-[12px] h-8 px-2 xl:px-3 uppercase tracking-wider"
                      >
                        <Star className="w-3.5 h-3.5 mr-1" />
                        {t("nav.subscribe")}
                      </Button>
                    </Link>
                    <Button
                      onClick={handleLogoutClick}
                      variant="outline"
                      size="sm"
                      className="border-border text-foreground hover:bg-accent/10 text-[12px] h-8 px-2 xl:px-3 font-bold uppercase tracking-wider"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-1" />
                      {t("nav.logout")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border text-foreground hover:bg-accent/10 text-[12px] h-8 px-2 xl:px-3 font-bold uppercase tracking-wider"
                      >
                        <User className="w-3.5 h-3.5 mr-1" />
                        {t("nav.login")}
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20 text-[12px] h-8 px-2 xl:px-3 uppercase tracking-wider"
                      >
                        {t("nav.signup")}
                      </Button>
                    </Link>
                  </>
                )}

                {/* Always show Admin link on desktop */}
                <Link href="/admin/login">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary hover:bg-accent/10 h-8 w-8 ml-0.5 transition-colors"
                    title={t("nav.admin")}
                  >
                    <Shield className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden text-foreground p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              suppressHydrationWarning
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 px-4 md:px-6 lg:px-8 space-y-3 bg-background/95 backdrop-blur-2xl border-t border-border">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-muted-foreground hover:text-foreground transition-colors py-3 font-bold text-sm uppercase tracking-wider border-b border-border last:border-b-0"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 py-3 border-b border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="flex-1 border-border text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4 mr-2" />
                ) : (
                  <Sun className="w-4 h-4 mr-2" />
                )}
                {theme === "light" ? "Dark" : "Light"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="flex-1 border-border text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              >
                <Languages className="w-4 h-4 mr-2" />
                {language === "en" ? "हिंदी" : "English"}
              </Button>
            </div>
            <div className="pt-4 space-y-3 border-t border-border">
              {user ? (
                <>
                  <p className="text-xs text-muted-foreground font-black uppercase tracking-widest px-1 py-1">
                    Hi, {user.name}
                  </p>
                  <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-border text-foreground hover:bg-accent/10"
                    >
                      {t("nav.profile")}
                    </Button>
                  </Link>
                  <Button
                    onClick={handleLogoutClick}
                    variant="outline"
                    size="sm"
                    className="w-full border-border text-foreground hover:bg-accent/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> {t("nav.logout")}
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-border text-foreground hover:bg-accent/10"
                    >
                      <User className="w-4 h-4 mr-2" /> {t("nav.login")}
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black"
                    >
                      {t("nav.signup")}
                    </Button>
                  </Link>
                </div>
              )}
              <div className="pt-2">
                <Link href="/admin/login" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-border text-muted-foreground hover:text-foreground hover:bg-accent/10"
                  >
                    <Shield className="w-5 h-5 mr-2" /> {t("nav.admin")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <LogoutConfirmModal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}
