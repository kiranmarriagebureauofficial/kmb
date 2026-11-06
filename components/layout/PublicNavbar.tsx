'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '../brand/BrandLogo';
import { LanguageToggle } from '../brand/LanguageToggle';
import { Menu, X, HeartHandshake, PhoneCall, Lock } from 'lucide-react';
import { store } from '@/lib/db/store';
import { t } from '@/lib/i18n';

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lang = store.getLanguage();

  const navLinks = [
    { href: '/', label: t('navHome', lang) },
    { href: '/about', label: t('navAbout', lang) },
    { href: '/how-it-works', label: t('navHowItWorks', lang) },
    { href: '/success-stories', label: t('navSuccessStories', lang) },
    { href: '/premium-membership', label: t('navPremium', lang) },
    { href: '/contact', label: t('navContact', lang) },
  ];

  const settings = store.getSettings();

  return (
    <header className="sticky top-0 z-50 bg-[#5A0A14] text-[#FBF4E6] shadow-md border-b border-[#D9A93F]/30 no-print">
      {/* Top micro bar with contact & discreet staff login */}
      <div className="bg-[#420610] text-xs text-[#E9DDC3] border-b border-[#5A0A14] px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D9A93F]" />
            <span>Lahore Office: {settings.phone1}</span>
          </span>
          <span className="hidden md:inline text-[#D9A93F]/60">|</span>
          <span className="hidden md:inline">Jail Road, Gulberg V, Lahore</span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle variant="maroon" />
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs text-[#D9A93F] hover:text-[#EBCB7C] transition-colors"
          >
            <Lock className="w-3 h-3" />
            <span>{t('navLogin', lang)}</span>
          </Link>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center py-2 group">
            <BrandLogo variant="banner" width={260} height={70} priority />
          </Link>

          {/* Desktop Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors py-1 border-b-2 ${
                    isActive
                      ? 'text-[#D9A93F] border-[#D9A93F]'
                      : 'text-[#FBF4E6] border-transparent hover:text-[#D9A93F]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold tracking-wide bg-[#D9A93F] text-[#420610] hover:bg-[#EBCB7C] shadow-md transition-all border border-[#B08626]"
            >
              <HeartHandshake className="w-4 h-4 text-[#420610]" />
              <span>{t('navRegister', lang)}</span>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#FBF4E6] hover:bg-[#420610] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#420610] border-t border-[#D9A93F]/20 px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-md text-base font-medium ${
                  pathname === link.href
                    ? 'bg-[#5A0A14] text-[#D9A93F]'
                    : 'text-[#FBF4E6] hover:bg-[#5A0A14]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-[#5A0A14] flex flex-col gap-2">
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-lg text-sm font-bold bg-[#D9A93F] text-[#420610]"
            >
              {t('navRegister', lang)}
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg text-xs font-semibold text-[#E9DDC3] border border-[#5A0A14]"
            >
              {t('navLogin', lang)}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
