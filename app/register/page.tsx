'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { LanguageToggle } from '@/components/brand/LanguageToggle';
import { ProfileForm } from '@/components/profiles/ProfileForm';
import { store } from '@/lib/db/store';
import { useLanguage } from '@/lib/useLanguage';
import { ShieldCheck, Lock, FileCheck, Phone, AlertCircle } from 'lucide-react';

function RegisterFormContent() {
  const { tr } = useLanguage();
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
      <div className="max-w-xl mx-auto my-16 p-8 bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-[#A3182E]/10 text-[#A3182E] flex items-center justify-center mx-auto border border-[#A3182E]/30">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#800F2F]">
          {tr('Online Registration Currently Unavailable', 'آن لائن رجسٹریشن اس وقت بند ہے')}
        </h2>
        <p className="text-xs text-[#6E6466] leading-relaxed">
          {tr(
            'The administration of Kiran Marriage Bureau (Lahore) has temporarily paused direct online submissions. Please contact our head office directly by telephone or WhatsApp for assistance.',
            'کرن میرج بیورو (لاہور) کی انتظامیہ نے آن لائن رجسٹریشن کا لنک عارضی طور پر بند کر دیا ہے۔ براہ کرم رہنمائی کے لیے ہمارے ہیڈ آفس سے فون یا واٹس ایپ پر رابطہ کریں۔'
          )}
        </p>
        <div className="pt-2">
          <a
            href={`tel:${bureauPhone}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#800F2F] text-[#F8F5F0] text-xs font-semibold hover:bg-[#660A22] transition-colors"
          >
            <Phone className="w-4 h-4 text-[#D4AF37]" />
            <span dir="ltr">{tr('Call Bureau Office:', 'بیورو آفس پر کال کریں:')} {bureauPhone}</span>
          </a>
        </div>
      </div>
    );
  }

  return <ProfileForm isPublic={true} />;
}

export default function RegisterPage() {
  const { tr } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F5F0] text-[#2C2526]">
      {/* Minimal Standalone Header */}
      <header className="bg-[#800F2F] text-[#F8F5F0] border-b border-[#D4AF37]/40 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <BrandLogo variant="banner" width={240} height={80} priority />
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] font-serif uppercase tracking-widest text-[#D4AF37] hidden md:inline-block">
              {tr('Confidential Matrimonial Registration', 'خفیہ ازدواجی رجسٹریشن')}
            </span>
            <LanguageToggle variant="maroon" />
          </div>
        </div>
      </header>

      {/* Assurance Banner */}
      <div className="bg-[#FFFFFF] border-b border-[#E5DFD5] py-2.5 px-4 text-xs text-[#6E6466]">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-6 sm:gap-10 flex-wrap text-center">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#B88B22]" />
            <span>{tr('100% Confidential & Secure', '۱۰۰٪ خفیہ اور محفوظ')}</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Lock className="w-4 h-4 text-[#B88B22]" />
            <span>{tr('Contact details seen only by verified staff', 'رابطہ نمبرز صرف مجاز عملہ دیکھ سکتا ہے')}</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <FileCheck className="w-4 h-4 text-[#B88B22]" />
            <span>{tr('Direct Lahore Bureau Office', 'براہِ راست لاہور بیورو دفتر')}</span>
          </span>
        </div>
      </div>

      {/* Main Registration Form Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full py-8 px-4 sm:px-6">
        <Suspense fallback={<div className="p-12 text-center text-xs text-[#6E6466]">{tr('Loading registration portal...', 'رجسٹریشن پورٹل لوڈ ہو رہا ہے...')}</div>}>
          <RegisterFormContent />
        </Suspense>
      </main>

      {/* Minimal Discreet Footer */}
      <footer className="py-4 px-4 text-center text-[11px] text-[#6E6466] border-t border-[#E5DFD5] bg-[#FFFFFF]">
        <p>© {new Date().getFullYear()} {tr('Kiran Marriage Bureau, Lahore. All personal information is strictly protected.', 'کرن میرج بیورو، لاہور۔ تمام ذاتی معلومات مکمل طور پر محفوظ ہیں۔')}</p>
      </footer>
    </div>
  );
}
