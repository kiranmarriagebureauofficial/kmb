'use client';

import React from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { FileText, Search, UserCheck, HeartHandshake, CheckCircle2 } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Registration & Requirement Consultation',
      titleUr: 'رجسٹریشن اور خاندانی ترجیحات کا اندراج',
      desc: 'Submit your profile online or visit our office. You provide details regarding education, profession, family background, caste, and partner preferences.',
      icon: FileText,
    },
    {
      num: '02',
      title: 'Profile Verification & Security Screening',
      titleUr: 'کوائف کی تصدیق اور چھان بین',
      desc: 'Our staff contacts the guardian, verifies phone numbers, credentials, and ensures the family is genuine and in pursuit of solemn marriage.',
      icon: UserCheck,
    },
    {
      num: '03',
      title: 'AI Compatibility Matching & Proposal Shortlisting',
      titleUr: 'ہم آہنگی اور بہترین منتخب رشتے',
      desc: 'Our dual-weighted matching engine evaluates mutual suitability (age, education, caste, city, profession, sect) and presents top 75%+ and 50%+ matches.',
      icon: Search,
    },
    {
      num: '04',
      title: 'Dignified Introduction & Family Sitting',
      titleUr: 'باعزت تعارف اور خاندانی ملاقات',
      desc: 'Upon mutual interest from both sides, sanitized profiles are exchanged. We coordinate a dignified telephonic or in-person tea sitting at our Lahore office.',
      icon: HeartHandshake,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF4E6] text-[#2A0A0F]">
      <PublicNavbar />

      <section className="bg-[#5A0A14] text-[#FBF4E6] py-16 px-4 text-center border-b border-[#D9A93F]/40">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-xs uppercase font-serif tracking-widest text-[#D9A93F] font-bold">
            Transparent, Dignified Process
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold">
            How Kiran Marriage Bureau Works
          </h1>
          <p className="font-urdu text-lg sm:text-2xl text-[#D9A93F]">
            چار آسان اور باوقار مراحل میں رشتہ تلاش کا عمل
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-5xl mx-auto py-14 px-4 sm:px-6 space-y-12">
        <div className="space-y-8">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC3] shadow-sm flex flex-col sm:flex-row items-start gap-6 hover:border-[#D9A93F] transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#5A0A14] text-[#D9A93F] border border-[#D9A93F] flex items-center justify-center shrink-0 font-serif font-bold text-xl shadow-sm">
                  {st.num}
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="font-serif text-lg font-bold text-[#5A0A14]">
                      {st.title}
                    </h3>
                    <span className="font-urdu text-sm text-[#B08626]">
                      {st.titleUr}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#7B5E5E] leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Divider />

        <div className="text-center space-y-4">
          <h3 className="font-serif text-2xl font-bold text-[#5A0A14]">
            Ready to Find a Respectable Match?
          </h3>
          <p className="text-xs text-[#7B5E5E]">
            Submit your profile online in less than 5 minutes. No public signup required.
          </p>
          <Link href="/register">
            <Button size="lg" variant="primary" icon={<HeartHandshake className="w-4 h-4 text-[#D9A93F]" />}>
              Register Profile Now
            </Button>
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
