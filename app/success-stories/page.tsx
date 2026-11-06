'use client';

import React from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Heart, Star, Quote } from 'lucide-react';

export default function SuccessStoriesPage() {
  const stories = [
    {
      couple: 'Dr. Shahzad (KEMU) & Dr. Anum (Fatima Jinnah)',
      castes: 'Arain Family • Lahore',
      quote:
        'Finding an educated medical match with strict religious and family alignment seemed challenging. Kiran Marriage Bureau introduced our families with immense respect. Alhamdullilah, we celebrated our wedding at Pearl Continental Lahore.',
      date: 'Finalized: January 2026',
    },
    {
      couple: 'Engr. Haroon (UET) & Maryam (FAST-NUCES)',
      castes: 'Rajput Family • Lahore / Islamabad',
      quote:
        'The dual-matching system matched our preferences with 88% precision! Begum Kiran Shah personally facilitated our mothers’ discussion. The entire process was dignified and free from commercial pressure.',
      date: 'Finalized: August 2025',
    },
    {
      couple: 'Zubair Sheikh (Manchester, UK) & Mahrukh (LUMS)',
      castes: 'Sheikh Family • Lahore / UK Overseas',
      quote:
        'Being settled in the UK, my parents in Johar Town were worried about finding an educated, cultured daughter-in-law willing to relocate. Kiran Bureau verified everything thoroughly. Highly recommended!',
      date: 'Finalized: November 2025',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF4E6] text-[#2A0A0F]">
      <PublicNavbar />

      <section className="bg-[#5A0A14] text-[#FBF4E6] py-16 px-4 text-center border-b border-[#D9A93F]/40">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-xs uppercase font-serif tracking-widest text-[#D9A93F] font-bold">
            Blessings & Marriages Finalized
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold">
            Bureau Success Stories
          </h1>
          <p className="font-urdu text-lg sm:text-2xl text-[#D9A93F]">
            اللہ تعالیٰ کے فضل و کرم سے کامیاب ہونے والے باوقار رشتے
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-5xl mx-auto py-14 px-4 sm:px-6 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stories.map((st, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC3] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#D9A93F] transition-all"
            >
              <div className="space-y-3">
                <Quote className="w-8 h-8 text-[#D9A93F]/40" />
                <p className="text-xs text-[#7B5E5E] leading-relaxed italic">
                  "{st.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#E9DDC3] space-y-1">
                <div className="flex items-center gap-1 text-[#D9A93F]">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-3 h-3 fill-[#D9A93F]" />
                  ))}
                </div>
                <h4 className="font-serif text-sm font-bold text-[#5A0A14]">
                  {st.couple}
                </h4>
                <p className="text-[11px] text-[#7B5E5E]">
                  {st.castes}
                </p>
                <span className="text-[10px] text-[#B08626] block font-mono">
                  {st.date}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Divider />

        <div className="text-center space-y-4">
          <h3 className="font-serif text-2xl font-bold text-[#5A0A14]">
            Start Your Family's Success Journey
          </h3>
          <p className="text-xs text-[#7B5E5E]">
            Submit your profile online or consult directly with our matchmaking coordinators.
          </p>
          <Link href="/register">
            <Button size="lg" variant="primary" icon={<Heart className="w-4 h-4 text-[#D9A93F]" />}>
              Submit Your Rishta Profile
            </Button>
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
