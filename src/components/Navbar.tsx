'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import the Image component
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/kundali', label: 'Kundali' },
    { href: '/palmistry', label: 'Palmistry' },
    { href: '/numerology', label: 'Numerology' },
    { href: '/consultation', label: 'Consultation' },
    { href: '/subscription', label: 'Subscription' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-amber-200 classical-shadow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Updated Logo Section with smaller size */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png" // Path to your logo in the 'public' folder
              alt="Viprakarma Logo"
              width={80} // Adjusted width for a smaller logo
              height={12} // Adjusted height to maintain aspect ratio
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-amber-700 hover:bg-amber-50 px-3 py-2 rounded-md transition-all duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 text-gray-700 bg-amber-50 px-4 py-2 rounded-lg">
                  <User className="w-5 h-5 text-amber-700" />
                  <span className="font-medium">{user.name}</span>
                </div>
                <Button
                  onClick={logout}
                  variant="outline"
                  size="sm"
                  className="border-amber-600 text-amber-900 hover:bg-amber-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="border-amber-600 text-amber-900 hover:bg-amber-50">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white classical-shadow">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-amber-200">
          <div className="container mx-auto px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-amber-700 hover:bg-amber-50 px-4 py-3 rounded-md transition-all duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-amber-200 space-y-3">
              {user ? (
                <>
                  <div className="flex items-center gap-2 text-gray-700 bg-amber-50 px-4 py-3 rounded-lg">
                    <User className="w-5 h-5 text-amber-700" />
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <Button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full border-amber-600 text-amber-900 hover:bg-amber-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block">
                    <Button variant="outline" className="w-full border-amber-600 text-amber-900 hover:bg-amber-50">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block">
                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white classical-shadow">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}