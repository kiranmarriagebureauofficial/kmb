'use client';

import React from 'react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Divider } from '@/components/ui/Divider';
import { store } from '@/lib/db/store';
import { ShieldCheck, HeartHandshake, Award, Users, MapPin } from 'lucide-react';

export default function AboutPage() {
  const settings = store.getSettings();

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF4E6] text-[#2A0A0F]">
      <PublicNavbar />

      {/* Header */}
      <section className="bg-[#5A0A14] text-[#FBF4E6] py-16 px-4 text-center border-b border-[#D9A93F]/40">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-xs uppercase font-serif tracking-widest text-[#D9A93F] font-bold">
            Established in Lahore Since 2012
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold">
            About Kiran Marriage Bureau
          </h1>
          <p className="font-urdu text-lg sm:text-2xl text-[#D9A93F]">
            لاہور میں باوقار، بااعتماد اور روایتی خاندانی اقدار کا علمبردار
          </p>
          <p className="text-xs sm:text-sm text-[#E9DDC3] max-w-2xl mx-auto">
            Dedicated to bringing together respectable Pakistani families through dignified introductions, strict religious harmony, and uncompromising confidentiality.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto py-14 px-4 sm:px-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 text-xs sm:text-sm text-[#7B5E5E] leading-relaxed">
            <h2 className="font-serif text-2xl font-bold text-[#5A0A14]">
              Our Matrimonial Charter & Philosophy
            </h2>
            <p>
              In traditional Pakistani society, marriage is not merely the union of two individuals — it is the sacred bond between two families, their values, cultures, and generations.
            </p>
            <p>
              Founded by Begum Kiran Shah in Lahore, Kiran Marriage Bureau was established to counter commercialized, superficial matching. We provide a sanctuary where parents can discuss their children’s futures with complete honor and discretion.
            </p>
            <p>
              Whether you are looking for highly educated professionals (Doctors, Engineers, Chartered Accountants, Civil Servants) or noble business and agricultural lineages, our personalized consultants handle each case with meticulous care.
            </p>
          </div>

          <div className="bg-[#FFFDF8] border-2 border-[#D9A93F] rounded-2xl p-6 shadow-md space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#5A0A14] border-b border-[#E9DDC3] pb-2">
              Our Bureau Core Standards
            </h3>
            <ul className="space-y-3 text-xs text-[#2A0A0F]">
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#D9A93F] shrink-0 mt-0.5" />
                <span><strong>Zero Compromise on Privacy:</strong> Contact numbers are never shared on WhatsApp or public directories without prior family consent.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Award className="w-4 h-4 text-[#D9A93F] shrink-0 mt-0.5" />
                <span><strong>Multi-Point Verification:</strong> Telephone, CNIC, and educational credentials of candidates are audited by staff.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Users className="w-4 h-4 text-[#D9A93F] shrink-0 mt-0.5" />
                <span><strong>Cultural & Religious Alignment:</strong> Strict respect for individual caste, family culture, and maslak traditions.</span>
              </li>
            </ul>
          </div>
        </div>

        <Divider />

        {/* Lahore Office Section */}
        <div className="p-8 bg-[#FFFDF8] border border-[#E9DDC3] rounded-2xl text-center space-y-4">
          <MapPin className="w-8 h-8 text-[#5A0A14] mx-auto" />
          <h3 className="font-serif text-xl font-bold text-[#5A0A14]">
            Visit Our Lahore Office
          </h3>
          <p className="text-xs text-[#7B5E5E] max-w-xl mx-auto">
            {settings.address}
          </p>
          <p className="text-xs font-semibold text-[#5A0A14]">
            Meetings are scheduled by prior appointment only to ensure absolute privacy for each visiting family.
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
