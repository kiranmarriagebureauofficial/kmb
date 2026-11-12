'use client';

import React from 'react';
import { ProfileForm } from '@/components/profiles/ProfileForm';
import { useLanguage } from '@/lib/useLanguage';

export default function NewProfilePage() {
  const { tr } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5DFD5] shadow-sm">
        <span className="text-[11px] uppercase font-serif font-bold tracking-widest text-[#B88B22]">
          {tr('Staff Registration Intake', 'عملے کی جانب سے نیا اندراج')}
        </span>
        <h1 className="font-serif text-2xl font-bold text-[#800F2F] mt-0.5">
          {tr('Add New Rishta Profile', 'نیا رشتہ پروفائل شامل کریں')}
        </h1>
        <p className="text-xs text-[#6E6466]">
          {tr(
            'Matches the official paper registration form. Live side panel will compute top compatible matches in real-time as fields are filled.',
            'سرکاری رجسٹر فارم کے مطابق۔ تفصیلات درج کرتے ہی دائیں/بائیں پینل میں لائیو موزوں رشتے فوری طور پر ظاہر ہوتے رہیں گے۔'
          )}
        </p>
      </div>

      <ProfileForm isPublic={false} />
    </div>
  );
}

