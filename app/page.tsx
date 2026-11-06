'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { store } from '@/lib/db/store';
import { t } from '@/lib/i18n';
import { generateWhatsAppLink } from '@/lib/utils';
import { 
  HeartHandshake, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  Star, 
  PhoneCall, 
  ArrowRight, 
  CheckCircle2, 
  Lock,
  Building2,
  CalendarCheck
} from 'lucide-react';

export default function HomePage() {
  const lang = store.getLanguage();
  const settings = store.getSettings();

  const trustPoints = [
    {
      title: t('why1Title', lang),
      desc: t('why1Desc', lang),
      icon: ShieldCheck,
    },
    {
      title: t('why2Title', lang),
      desc: t('why2Desc', lang),
      icon: Lock,
    },
    {
      title: t('why3Title', lang),
      desc: t('why3Desc', lang),
      icon: Sparkles,
    },
  ];

  const steps = [
    {
      number: '01',
      title: t('step1Title', lang),
      desc: t('step1Desc', lang),
    },
    {
      number: '02',
      title: t('step2Title', lang),
      desc: t('step2Desc', lang),
    },
    {
      number: '03',
      title: t('step3Title', lang),
      desc: t('step3Desc', lang),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF4E6] text-[#2A0A0F]">
      <PublicNavbar />

      {/* Hero Section (Maroon with gold line art & flourish) */}
      <section className="relative bg-[#5A0A14] text-[#FBF4E6] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[#D9A93F]/40">
        {/* Subtle background ornamentation */}
        <div className="absolute inset-0 bg-ornament opacity-20 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          {/* Hero Banner Logo */}
          <div className="flex justify-center">
            <BrandLogo variant="banner" width={380} height={110} priority />
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#FBF4E6] leading-tight">
              {t('heroTitle', lang)}
            </h1>

            <p className="font-urdu text-lg sm:text-2xl text-[#D9A93F] leading-relaxed">
              شریف اور باوقار پاکستانی خاندانوں کے لیے بااعتماد اور تصدیق شدہ رشتے
            </p>

            <p className="text-sm sm:text-base text-[#E9DDC3] max-w-2xl mx-auto leading-relaxed">
              {t('heroSubtitle', lang)}
            </p>
          </div>

          {/* CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                variant="accent"
                icon={<HeartHandshake className="w-5 h-5 text-[#420610]" />}
                className="shadow-xl"
              >
                {t('heroCtaRegister', lang)}
              </Button>
            </Link>

            <a
              href={generateWhatsAppLink(
                settings.whatsapp,
                'Assalam-o-Alaikum, I am inquiring about rishta proposals at Kiran Marriage Bureau Lahore.'
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="secondary"
                icon={<PhoneCall className="w-5 h-5 text-[#5A0A14]" />}
                className="bg-[#FBF4E6] text-[#5A0A14] border-[#D9A93F]"
              >
                {t('heroCtaContact', lang)}
              </Button>
            </a>
          </div>

          {/* Verification Badge */}
          <div className="pt-4 flex items-center justify-center gap-6 text-xs text-[#E9DDC3] flex-wrap">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D9A93F]" />
              <span>Identity & Family Background Checked</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#D9A93F]" />
              <span>Strict Contact Privacy Guaranteed</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#D9A93F]" />
              <span>Physical Office in Gulberg, Lahore</span>
            </span>
          </div>
        </div>
      </section>

      {/* Section: Trust Pillars (Ivory background with white-ivory cards) */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase font-serif font-bold tracking-widest text-[#B08626] block">
            Dignity & Discretion
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#5A0A14] mt-1">
            {t('whyChooseTitle', lang)}
          </h2>
          <Divider className="max-w-xs mx-auto my-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustPoints.map((point, idx) => {
            const Icon = point.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC3] shadow-sm hover:shadow-md transition-all text-center space-y-4 group hover:border-[#D9A93F]"
              >
                <div className="w-14 h-14 rounded-full bg-[#5A0A14] text-[#D9A93F] border border-[#D9A93F] flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform">
                  <Icon className="w-7 h-7 text-[#D9A93F]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#5A0A14]">
                  {point.title}
                </h3>
                <p className="text-xs text-[#7B5E5E] leading-relaxed">
                  {point.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section: How It Works in 3 Steps (Alternating Deep Maroon) */}
      <section className="bg-[#5A0A14] text-[#FBF4E6] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-y border-[#D9A93F]/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs uppercase font-serif font-bold tracking-widest text-[#D9A93F] block">
              Respectful Matrimonial Coordination
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#FBF4E6] mt-1">
              {t('howItWorksTitle', lang)}
            </h2>
            <div className="w-24 h-0.5 bg-[#D9A93F] mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((st, i) => (
              <div
                key={i}
                className="relative p-6 rounded-2xl bg-[#420610] border border-[#D9A93F]/30 space-y-3"
              >
                <span className="font-serif text-4xl font-bold text-[#D9A93F]/40">
                  {st.number}
                </span>
                <h3 className="font-serif text-lg font-bold text-[#FBF4E6]">
                  {st.title}
                </h3>
                <p className="text-xs text-[#E9DDC3] leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/register">
              <Button size="lg" variant="accent" icon={<HeartHandshake className="w-4 h-4 text-[#420610]" />}>
                Start Your Online Registration
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section: Premium Membership Highlight */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-[#FFFDF8] border-2 border-[#D9A93F] rounded-3xl p-8 sm:p-12 shadow-md relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D9A93F] text-[#420610]">
                <Star className="w-3.5 h-3.5 fill-[#420610]" />
                <span>Kiran Premium Rishtay Club</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#5A0A14]">
                Exclusive Matchmaking for Doctors, Engineers, Civil Servants & Business Families
              </h2>
              <p className="text-xs sm:text-sm text-[#7B5E5E] leading-relaxed">
                Our elite personalized matchmaking track provides dedicated matrimonial consultants, direct family coordination, prioritized 75%+ compatibility suggestions, and overseas relocation proposals.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                <div className="flex items-center gap-2 text-[#2A0A0F]">
                  <CheckCircle2 className="w-4 h-4 text-[#D9A93F]" />
                  <span>Personal Senior Matchmaker assigned</span>
                </div>
                <div className="flex items-center gap-2 text-[#2A0A0F]">
                  <CheckCircle2 className="w-4 h-4 text-[#D9A93F]" />
                  <span>Direct family meeting coordination at Lahore office</span>
                </div>
                <div className="flex items-center gap-2 text-[#2A0A0F]">
                  <CheckCircle2 className="w-4 h-4 text-[#D9A93F]" />
                  <span>Prioritized 75%+ high-tier proposals</span>
                </div>
                <div className="flex items-center gap-2 text-[#2A0A0F]">
                  <CheckCircle2 className="w-4 h-4 text-[#D9A93F]" />
                  <span>Verified foreign and overseas Pakistani matches</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 text-center p-6 bg-[#FBF4E6] rounded-2xl border border-[#E9DDC3] space-y-4">
              <span className="text-xs uppercase font-bold text-[#7B5E5E] tracking-wider block">
                6-Month Membership
              </span>
              <p className="font-serif text-3xl font-bold text-[#5A0A14]">
                PKR {settings.feeDefaults.premiumMembershipFee.toLocaleString()}
              </p>
              <p className="text-[11px] text-[#7B5E5E]">
                Inclusive of registration, personalized consultant, and unlimited verified introductions.
              </p>
              <Link href="/premium-membership" className="block w-full">
                <Button size="md" variant="primary" className="w-full">
                  Explore Premium Benefits
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}
