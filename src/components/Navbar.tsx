'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Menu, X, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, adminLogout, isAdminLoggedIn } = useAuth();

  const navLinks = [
    { href: '/kundali', label: 'Kundali' },
    { href: '/numerology', label: 'Numerology' },
    { href: '/palmistry', label: 'Palmistry' },
    { href: '/consultation', label: 'Consultation' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/subscription', label: 'Subscribe' },
  ];

  return (
    <nav className="bg-amber-50/90 backdrop-blur-lg border-b border-amber-200/80 sticky top-0 z-50 shadow-lg shadow-amber-800/5">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <Sparkles className="w-6 h-6 md:w-9 md:h-9 text-amber-600" />
            <span className="text-2xl md:text-3xl font-bold golden-text tracking-wide">Viprakarma</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-amber-700 transition-all duration-300 font-semibold px-3 md:px-4 py-2 rounded-md hover:bg-amber-100/50 text-sm md:text-base"
              >
                {link.label}
              </Link>
            ))}

            <div className="w-px h-6 bg-amber-200 mx-3"></div>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 font-medium hidden xl:block">Hi, {user.name}</span>
                <Button
                  onClick={isAdminLoggedIn ? adminLogout : logout}
                  variant="outline"
                  size="sm"
                  className="border-amber-600 text-amber-700 hover:bg-amber-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-3">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="border-amber-600 text-amber-700 hover:bg-amber-100 text-sm">
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shadow shadow-amber-600/30 text-sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            <Link href="/admin/login">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-amber-700 hover:bg-amber-100 ml-2"
                title="Admin Portal"
              >
                <Shield className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-gray-700 p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden py-4 px-4 md:px-6 lg:px-8 space-y-3 bg-amber-50 border-t border-amber-200">
          {navLinks.map((link) => (
             <Link
               key={link.href}
               href={link.href}
               className="block text-gray-700 hover:text-amber-700 transition-colors py-3 font-medium text-base border-b border-amber-100 last:border-b-0"
               onClick={() => setIsMenuOpen(false)}
             >
                {link.label}
              </Link>
          ))}

          <div className="pt-4 space-y-3 border-t border-amber-200">
            {user ? (
                <>
                    <p className="text-sm text-gray-600 px-1 py-2">Hi, {user.name}</p>
                    <Button
                      onClick={() => {
                        isAdminLoggedIn ? adminLogout() : logout();
                        setIsMenuOpen(false);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full border-amber-600 text-amber-700"
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                </>
            ) : (
                <div className="space-y-3">
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full border-amber-600 text-amber-700">
                            <User className="w-4 h-4 mr-2" /> Login
                        </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                        <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                            Sign Up
                        </Button>
                    </Link>
                </div>
            )}
             <div className="pt-2">
                <Link href="/admin/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full border-gray-300 text-gray-600 hover:bg-gray-50">
                        <Shield className="w-4 h-4 mr-2" /> Admin Portal
                    </Button>
                </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
