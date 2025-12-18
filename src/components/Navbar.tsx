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

export default function Navbar() {
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
    { href: "/numerology", label: t("nav.numerology") },
    { href: "/palmistry", label: t("nav.palmistry") },
    { href: "/mahurat", label: t("nav.mahurat") },
    { href: "/consultation", label: t("nav.consultation") },
    { href: "/talk-to-astrologer", label: t("nav.talkToAstrologer") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
    { href: "/pooja-booking", label: t("nav.poojaBooking") },
  ];

  return (
    <>
      <nav className="bg-amber-50/90 backdrop-blur-lg border-b border-amber-200/80 sticky top-0 z-50 shadow-lg shadow-amber-800/5 dark:bg-slate-900/90 dark:border-slate-700/80">
        <div className="container mx-auto px-2 md:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 md:gap-2 shrink-0">
              <Sparkles className="w-5 h-5 md:w-7 md:h-7 text-amber-600 dark:text-amber-400" />
              <span className="text-xl md:text-2xl font-bold golden-text tracking-tight">
                Viprakarma
              </span>
            </Link>
            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
              <div className="flex items-center">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-700 hover:text-amber-700 dark:text-gray-200 dark:hover:text-amber-400 transition-all duration-300 font-medium px-2 xl:px-3 py-2 rounded-md hover:bg-amber-100/50 dark:hover:bg-slate-800/50 text-[13px] xl:text-sm whitespace-nowrap"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="w-px h-6 bg-amber-200 dark:bg-slate-600 mx-1 xl:mx-2"></div>

              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                  className="text-gray-600 hover:text-amber-700 hover:bg-amber-100/50 dark:text-gray-300 dark:hover:text-amber-400 dark:hover:bg-slate-800/50 h-8 w-8"
                >
                  {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleLanguage}
                  title={`Switch to ${language === "en" ? "Hindi" : "English"}`}
                  className="text-gray-600 hover:text-amber-700 hover:bg-amber-100/50 dark:text-gray-300 dark:hover:text-amber-400 dark:hover:bg-slate-800/50 h-8 w-8"
                >
                  <Languages className="w-4 h-4" />
                  <span className="ml-1 text-[0.65rem] font-bold">{language.toUpperCase()}</span>
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
                        className="text-gray-700 hover:text-amber-700 hover:bg-amber-100 dark:text-gray-200 dark:hover:text-amber-400 dark:hover:bg-slate-800 text-[13px] h-8 px-2 xl:px-3"
                      >
                        {t("nav.profile")}
                      </Button>
                    </Link>
                    <Link href="/subscription">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-md text-[13px] h-8 px-2 xl:px-3"
                      >
                        <Star className="w-3.5 h-3.5 mr-1" />
                        {t("nav.subscribe")}
                      </Button>
                    </Link>
                    <Button
                      onClick={handleLogoutClick}
                      variant="outline"
                      size="sm"
                      className="border-amber-600 text-amber-700 hover:bg-amber-100 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-slate-800 text-[13px] h-8 px-2 xl:px-3"
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
                        className="border-amber-600 text-amber-700 hover:bg-amber-100 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-slate-800 text-[13px] h-8 px-2 xl:px-3"
                      >
                        <User className="w-3.5 h-3.5 mr-1" />
                        {t("nav.login")}
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white shadow shadow-amber-600/30 text-[13px] h-8 px-2 xl:px-3"
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
                    className="text-gray-500 hover:text-amber-700 hover:bg-amber-100 dark:text-gray-400 dark:hover:text-amber-400 dark:hover:bg-slate-800 h-8 w-8 ml-0.5"
                    title={t("nav.admin")}
                  >
                    <Shield className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden text-gray-700 dark:text-gray-200 p-2"
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
          <div className="lg:hidden py-4 px-4 md:px-6 lg:px-8 space-y-3 bg-amber-50 dark:bg-slate-900 border-t border-amber-200 dark:border-slate-700">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-gray-700 dark:text-gray-200 hover:text-amber-700 dark:hover:text-amber-400 transition-colors py-3 font-medium text-base border-b border-amber-100 dark:border-slate-700 last:border-b-0"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 py-3 border-b border-amber-100 dark:border-slate-700">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="flex-1 border-amber-600 text-amber-700 hover:bg-amber-100 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-slate-800"
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
                className="flex-1 border-amber-600 text-amber-700 hover:bg-amber-100 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-slate-800"
              >
                <Languages className="w-4 h-4 mr-2" />
                {language === "en" ? "हिंदी" : "English"}
              </Button>
            </div>
            <div className="pt-4 space-y-3 border-t border-amber-200 dark:border-slate-700">
              {user ? (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-300 px-1 py-2">
                    Hi, {user.name}
                  </p>
                  <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-amber-600 text-amber-700 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-slate-800"
                    >
                      {t("nav.profile")}
                    </Button>
                  </Link>
                  <Button
                    onClick={handleLogoutClick}
                    variant="outline"
                    size="sm"
                    className="w-full border-amber-600 text-amber-700 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-slate-800"
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
                      className="w-full border-amber-600 text-amber-700 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-slate-800"
                    >
                      <User className="w-4 h-4 mr-2" /> {t("nav.login")}
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      size="sm"
                      className="w-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white"
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
                    className="w-full border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
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
