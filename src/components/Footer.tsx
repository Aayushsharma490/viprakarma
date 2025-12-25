"use client";

import Link from "next/link";
import { Sparkles, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-background/80 backdrop-blur-3xl border-t border-border mt-32 relative z-50 transition-colors duration-500">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]" />
              <span className="text-2xl font-black text-foreground uppercase tracking-tighter font-sans">
                Vipra<span className="golden-text">karma</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm font-bold leading-relaxed uppercase tracking-wider">
              {t("footer.brandDesc")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-black mb-8 text-foreground uppercase tracking-[0.2em] font-sans">
              {t("footer.services")}
            </h3>
            <ul className="space-y-4">
              {[
                { href: "/kundali", label: t("footer.kundaliGenerator") },
                { href: "/numerology", label: t("footer.numerology") },
                { href: "/palmistry", label: t("footer.palmistryAnalysis") },
                { href: "/chat", label: t("footer.aiAstroChat") }
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-4 h-[1px] bg-primary mr-0 group-hover:mr-2 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-black mb-8 text-foreground uppercase tracking-[0.2em] font-sans">
              {t("footer.company")}
            </h3>
            <ul className="space-y-4">
              {[
                { href: "/about", label: t("footer.aboutUs") },
                { href: "/talk-to-astrologer", label: t("footer.ourAstrologers") },
                { href: "/subscription", label: t("footer.pricing") },
                { href: "/admin", label: t("footer.adminLogin") }
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center group"
                  >
                    <span className="w-0 group-hover:w-4 h-[1px] bg-primary mr-0 group-hover:mr-2 transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-black mb-8 text-foreground uppercase tracking-[0.2em] font-sans">
              {t("footer.contact")}
            </h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Email Us</div>
                  <div className="text-xs text-foreground font-black">support@viprakarma.com</div>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-primary mt-0.5" />
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Call Us</div>
                  <div className="text-xs text-foreground font-black">+91 9214556904</div>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div className="space-y-2">
                  <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Address</div>
                  <div className="text-xs text-foreground font-black leading-relaxed">
                    #22/23 16th Main Road, Peenya 2nd Stage, <br />
                    Bengaluru, Karnataka 560091
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
            © {currentYear} Viprakarma. {t("footer.copyright")}
          </p>
          <div className="flex gap-8">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-widest transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground text-[10px] font-black uppercase tracking-widest transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
