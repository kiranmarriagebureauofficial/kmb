'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { ProfileForm } from '@/components/profiles/ProfileForm';
import { store } from '@/lib/db/store';
import { ShieldCheck, Lock, HeartHandshake, FileCheck } from 'lucide-react';

function RegisterFormWithParams() {
  const searchParams = useSearchParams();
  const langParam = searchParams.get('lang');

  useEffect(() => {
    if (langParam === 'ur' || langParam === 'en') {
      store.setLanguage(langParam);
    }
  }, [langParam]);

  return <ProfileForm isPublic={true} />;
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBF4E6] text-[#2A0A0F]">
      <PublicNavbar />

      {/* Hero Header */}
      <section className="bg-[#5A0A14] text-[#FBF4E6] py-12 px-4 text-center border-b border-[#D9A93F]/40">
        <div className="max-w-4xl mx-auto space-y-3">
          <span className="text-xs uppercase font-serif tracking-widest text-[#D9A93F] font-bold">
            Official Online Matrimonial Registration
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold">
            Online Rishta Registration Form
          </h1>
          <p className="font-urdu text-base sm:text-xl text-[#D9A93F]">
            آن لائن رشتہ رجسٹریشن فارم - کرن میرج بیورو لاہور
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-[#E9DDC3] pt-2 flex-wrap">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D9A93F]" />
              <span>100% Confidential</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#D9A93F]" />
              <span>Contact details never made public</span>
            </span>
            <span className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-[#D9A93F]" />
              <span>Official Verification before matching</span>
            </span>
          </div>
        </div>
      </section>

      {/* Form Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full py-10 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="p-8 text-center text-xs text-[#7B5E5E]">Loading registration form...</div>}>
          <RegisterFormWithParams />
        </Suspense>
      </main>

      <PublicFooter />
    </div>
  );
}
