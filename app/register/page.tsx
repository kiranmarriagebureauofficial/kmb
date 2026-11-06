'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { LanguageToggle } from '@/components/brand/LanguageToggle';
import { ProfileForm } from '@/components/profiles/ProfileForm';
import { store } from '@/lib/db/store';
import { ShieldCheck, Lock, FileCheck, Phone, AlertCircle } from 'lucide-react';

function RegisterFormContent() {
  const searchParams = useSearchParams();
  const langParam = searchParams.get('lang');
  const [enabled, setEnabled] = useState(true);
  const [bureauPhone, setBureauPhone] = useState('+92 300 4567890');

  useEffect(() => {
    if (langParam === 'ur' || langParam === 'en') {
      store.setLanguage(langParam);
    }
    const settings = store.getSettings();
    setEnabled(settings.enableOnlineRegistrationLink !== false);
    setBureauPhone(settings.phone1 || '+92 300 4567890');

    const unsub = store.subscribe(() => {
      const s = store.getSettings();
      setEnabled(s.enableOnlineRegistrationLink !== false);
      setBureauPhone(s.phone1 || '+92 300 4567890');
    });
    return unsub;
  }, [langParam]);

  if (!enabled) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-[#FFFDF8] border border-[#E9DDC3] rounded-2xl text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-[#8E1B2B]/10 text-[#8E1B2B] flex items-center justify-center mx-auto border border-[#8E1B2B]/30">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#5A0A14]">
          Online Registration Currently Unavailable
        </h2>
        <p className="font-urdu text-base text-[#7B5E5E]">
          آن لائن رجسٹریشن کا لنک اس وقت منتظم کی طرف سے بند ہے۔
        </p>
        <p className="text-xs text-[#7B5E5E] leading-relaxed">
          The administration of Kiran Marriage Bureau (Lahore) has temporarily paused direct online submissions. Please contact our head office directly by telephone or WhatsApp for assistance.
        </p>
        <div className="pt-2">
          <a
            href={`tel:${bureauPhone}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#5A0A14] text-[#FBF4E6] text-xs font-semibold hover:bg-[#420610] transition-colors"
          >
            <Phone className="w-4 h-4 text-[#D9A93F]" />
            <span>Call Bureau Office: {bureauPhone}</span>
          </a>
        </div>
      </div>
    );
  }

  return <ProfileForm isPublic={true} />;
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF4E6] text-[#2A0A0F]">
      {/* Minimal Standalone Header */}
      <header className="bg-[#5A0A14] text-[#FBF4E6] border-b border-[#D9A93F]/40 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandLogo variant="banner" width={220} height={55} priority />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] font-serif uppercase tracking-widest text-[#D9A93F] hidden md:inline-block">
              Confidential Matrimonial Registration
            </span>
            <LanguageToggle variant="maroon" />
          </div>
        </div>
      </header>

      {/* Assurance Banner */}
      <div className="bg-[#FFFDF8] border-b border-[#E9DDC3] py-2.5 px-4 text-xs text-[#7B5E5E]">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-6 sm:gap-10 flex-wrap text-center">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#B08626]" />
            <span>100% Confidential & Secure</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Lock className="w-4 h-4 text-[#B08626]" />
            <span>Contact details seen only by verified staff</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <FileCheck className="w-4 h-4 text-[#B08626]" />
            <span>Direct Lahore Bureau Office</span>
          </span>
        </div>
      </div>

      {/* Main Registration Form Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full py-8 px-4 sm:px-6">
        <Suspense fallback={<div className="p-12 text-center text-xs text-[#7B5E5E]">Loading registration portal...</div>}>
          <RegisterFormContent />
        </Suspense>
      </main>

      {/* Minimal Discreet Footer */}
      <footer className="py-4 px-4 text-center text-[11px] text-[#7B5E5E] border-t border-[#E9DDC3] bg-[#FFFDF8]">
        <p>© {new Date().getFullYear()} Kiran Marriage Bureau, Lahore. All personal information is strictly protected.</p>
      </footer>
    </div>
  );
}
