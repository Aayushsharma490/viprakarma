'use client';

import Link from 'next/link';
import { Sparkles, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-effect border-t border-border/50 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold text-cosmic">Viprakarma</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Discover your cosmic blueprint with personalized astrology insights and expert spiritual guidance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/kundali" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  Kundali Generator
                </Link>
              </li>
              <li>
                <Link href="/numerology" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  Numerology
                </Link>
              </li>
              <li>
                <Link href="/palmistry" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  Palmistry Analysis
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  AI Astro Chat
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/talk-to-astrologer" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  Our Astrologers
                </Link>
              </li>
              <li>
                <Link href="/subscription" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-muted-foreground hover:text-primary text-sm transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="w-4 h-4 text-primary" />
                support@viprakarma.com
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="w-4 h-4 text-primary" />
                +91 9214556904
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                #22/23 16th Main Road, Near Old Konica Garments, <br />
       'Srigandha Nagar Peenya 2nd Stage, Hegganahalli, Bengaluru 560 091',
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 text-center">
          <p className="text-muted-foreground text-sm">
            © {currentYear} Viprakarma. All rights reserved. Made with ✨ for spiritual seekers.
          </p>
        </div>
      </div>
    </footer>
  );
}