'use client';

import React from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { store } from '@/lib/db/store';
import { formatPKR, generateWhatsAppLink } from '@/lib/utils';
import { Star, ShieldCheck, CheckCircle2, Crown, Sparkles, PhoneCall, HeartHandshake } from 'lucide-react';

export default function PremiumMembershipPage() {
  const settings = store.getSettings();

  const benefits = [
    'Top priority ranking across all searches and match calculations',
    'Designated Senior Matrimonial Consultant assigned exclusively to your family',
    'Direct coordination for verified families (Doctors, CSS Officers, Engineers, Industrialists)',
    'Full access to overseas Pakistani proposals (UK, USA, UAE, Canada, Australia)',
    'Exclusive private sitting arrangements in our Gulberg Lahore executive suites',
    'Specialized background verification of candidate education and employer status',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF4E6] text-[#2A0A0F]">
      <PublicNavbar />

      <section className="bg-[#5A0A14] text-[#FBF4E6] py-16 px-4 text-center border-b border-[#D9A93F]/40">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D9A93F] text-[#420610] text-xs font-bold shadow-sm">
            <Star className="w-4 h-4 fill-[#420610]" />
            <span>Kiran Premium Rishtay Club</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold">
            Personalized Matrimonial Concierge
          </h1>
          <p className="font-urdu text-lg sm:text-2xl text-[#D9A93F]">
            ڈاکٹرز، انجینئرز، اعلیٰ سرکاری افسران اور کاروباری خاندانوں کے لیے خصوصی سروس
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-5xl mx-auto py-14 px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#5A0A14]">
              Elevated, Confidential Matrimonial Search
            </h2>
            <p className="text-xs sm:text-sm text-[#7B5E5E] leading-relaxed">
              For distinguished families whose time is precious, our Premium Membership removes the friction of random calls and unsolicited proposals.
            </p>
            <div className="space-y-3">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-[#2A0A0F]">
                  <CheckCircle2 className="w-4 h-4 text-[#D9A93F] shrink-0 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-[#FFFDF8] border-2 border-[#D9A93F] rounded-3xl p-8 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#5A0A14] text-[#D9A93F] border-2 border-[#D9A93F] flex items-center justify-center mx-auto shadow-md">
              <Crown className="w-8 h-8 text-[#D9A93F]" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-serif font-bold tracking-widest text-[#B08626]">
                All-Inclusive 6 Months
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#5A0A14]">
                {formatPKR(settings.feeDefaults.premiumMembershipFee)}
              </h3>
              <p className="text-[11px] text-[#7B5E5E]">
                (Covers registration, dedicated consultant & unlimited introductions)
              </p>
            </div>

            <div className="p-4 bg-[#FBF4E6] rounded-xl border border-[#E9DDC3] text-xs text-[#7B5E5E] space-y-1">
              <p>Success Fee upon finalized rishta: {formatPKR(settings.feeDefaults.successFee)}</p>
              <p className="text-[10px] text-[#5A0A14] font-medium">Bilingual Urdu & English service</p>
            </div>

            <div className="space-y-3">
              <Link href="/register" className="block w-full">
                <Button size="lg" variant="accent" className="w-full">
                  Apply for Premium Membership
                </Button>
              </Link>

              <a
                href={generateWhatsAppLink(
                  settings.whatsapp,
                  'Assalam-o-Alaikum, I would like to inquire about the Premium Rishtay Club membership.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button size="md" variant="secondary" className="w-full" icon={<PhoneCall className="w-4 h-4 text-[#5A0A14]" />}>
                  Consult Senior Consultant on WhatsApp
                </Button>
              </a>
            </div>
          </div>
        </div>

        <Divider />
      </main>

      <PublicFooter />
    </div>
  );
}
