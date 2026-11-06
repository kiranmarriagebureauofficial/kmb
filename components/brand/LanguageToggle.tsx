'use client';

import React, { useEffect, useState } from 'react';
import { store } from '@/lib/db/store';
import { Languages } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
  variant?: 'maroon' | 'ivory';
}

export function LanguageToggle({ className = '', variant = 'ivory' }: LanguageToggleProps) {
  const [lang, setLang] = useState<'en' | 'ur'>('en');

  useEffect(() => {
    setLang(store.getLanguage());
    const unsub = store.subscribe(() => {
      setLang(store.getLanguage());
    });
    return unsub;
  }, []);

  const toggleLanguage = () => {
    const next = lang === 'en' ? 'ur' : 'en';
    store.setLanguage(next);
  };

  const isMaroon = variant === 'maroon';

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border ${
        isMaroon
          ? 'bg-[#660A22] text-[#F8F5F0] border-[#D4AF37]/40 hover:border-[#D4AF37]'
          : 'bg-[#FFFFFF] text-[#800F2F] border-[#E5DFD5] hover:border-[#D4AF37]'
      } ${className}`}
      title={lang === 'en' ? 'اردو میں دیکھیں' : 'Switch to English'}
    >
      <Languages className="w-3.5 h-3.5 text-[#D4AF37]" />
      <span className={lang === 'en' ? 'font-bold text-[#D4AF37]' : 'opacity-70'}>EN</span>
      <span className="opacity-40">|</span>
      <span className={lang === 'ur' ? 'font-bold text-[#D4AF37]' : 'opacity-70'}>اردو</span>
    </button>
  );
}

