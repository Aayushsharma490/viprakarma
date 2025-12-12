"use client";

import Link from "next/link";
import { Sparkles, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

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
              {t("footer.brandDesc")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">
              {t("footer.services")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/kundali"
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  {t("footer.kundaliGenerator")}
                </Link>
              </li>
              <li>
                <Link
                  href="/numerology"
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  {t("footer.numerology")}
                </Link>
              </li>
              <li>
                <Link
                  href="/palmistry"
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  {t("footer.palmistryAnalysis")}
                </Link>
              </li>
              <li>
                <Link
                  href="/chat"
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  {t("footer.aiAstroChat")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">
              {t("footer.company")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link
                  href="/talk-to-astrologer"
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  {t("footer.ourAstrologers")}
                </Link>
              </li>
              <li>
                <Link
                  href="/subscription"
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  {t("footer.pricing")}
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  {t("footer.adminLogin")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">
              {t("footer.contact")}
            </h3>
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
                'Srigandha Nagar Peenya 2nd Stage, Hegganahalli, Bengaluru 560
                091',
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 text-center">
          <p className="text-muted-foreground text-sm">
            © {currentYear} Viprakarma. {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
