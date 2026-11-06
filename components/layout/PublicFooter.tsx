'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '../brand/BrandLogo';
import { store } from '@/lib/db/store';
import { Phone, MapPin, Mail, MessageSquare, ShieldCheck, Heart } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/utils';

export function PublicFooter() {
  const settings = store.getSettings();

  return (
    <footer className="bg-[#420610] text-[#FBF4E6] border-t border-[#D9A93F]/30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <BrandLogo variant="wordmark" width={220} height={50} />
            <p className="text-xs text-[#E9DDC3] leading-relaxed">
              {settings.bureauTaglineEn}
            </p>
            <p className="text-xs font-urdu text-[#D9A93F] leading-relaxed">
              {settings.bureauTaglineUr}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#5A0A14] text-[#D9A93F] border border-[#D9A93F]/30">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D9A93F]" />
                <span>100% Confidential & Verified</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-serif font-bold uppercase tracking-wider text-[#D9A93F]">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs text-[#E9DDC3]">
              <li>
                <Link href="/" className="hover:text-[#D9A93F] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#D9A93F] transition-colors">
                  About the Bureau
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[#D9A93F] transition-colors">
                  Matchmaking Process
                </Link>
              </li>
              <li>
                <Link href="/success-stories" className="hover:text-[#D9A93F] transition-colors">
                  Success Stories
                </Link>
              </li>
              <li>
                <Link href="/premium-membership" className="hover:text-[#D9A93F] transition-colors">
                  Premium Rishtay Membership
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#D9A93F] transition-colors">
                  Online Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Lahore Office Location */}
          <div className="space-y-3">
            <h4 className="text-sm font-serif font-bold uppercase tracking-wider text-[#D9A93F]">
              Lahore Bureau Office
            </h4>
            <div className="space-y-2 text-xs text-[#E9DDC3]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D9A93F] shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D9A93F] shrink-0" />
                <span>{settings.phone1} / {settings.phone2}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D9A93F] shrink-0" />
                <span>{settings.email}</span>
              </div>
              <div className="pt-2 text-[11px] text-[#DECEAC]">
                Visiting Hours: Mon – Sat (11:00 AM – 7:00 PM)
                <br />
                (By prior appointment for family privacy)
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-serif font-bold uppercase tracking-wider text-[#D9A93F]">
              Direct Family Help
            </h4>
            <p className="text-xs text-[#E9DDC3] leading-relaxed">
              Speak directly with our senior matrimonial consultants regarding rishta requirements.
            </p>
            <a
              href={generateWhatsAppLink(
                settings.whatsapp,
                'Assalam-o-Alaikum, I am inquiring about rishta proposals at Kiran Marriage Bureau Lahore.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-[#5A0A14] hover:bg-[#7A1424] text-[#D9A93F] font-semibold text-xs border border-[#D9A93F]/40 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Connect on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-[#5A0A14] flex flex-col sm:flex-row items-center justify-between text-xs text-[#DECEAC]">
          <p>© {new Date().getFullYear()} Kiran Marriage Bureau (Lahore, Pakistan). All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            <span>Dignity, Honor & Trust in Matrimony</span>
            <Heart className="w-3 h-3 text-[#D9A93F] fill-[#D9A93F]" />
          </p>
        </div>
      </div>
    </footer>
  );
}
