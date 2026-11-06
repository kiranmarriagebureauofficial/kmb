'use client';

import React from 'react';
import { ProfileForm } from '@/components/profiles/ProfileForm';

export default function NewProfilePage() {
  return (
    <div className="space-y-6">
      <div className="bg-[#FFFDF8] p-5 rounded-2xl border border-[#E9DDC3] shadow-sm">
        <span className="text-[11px] uppercase font-serif font-bold tracking-widest text-[#B08626]">
          Staff Registration Intake
        </span>
        <h1 className="font-serif text-2xl font-bold text-[#5A0A14] mt-0.5">
          Add New Rishta Profile
        </h1>
        <p className="text-xs text-[#7B5E5E]">
          Matches the official paper registration form. Live side panel will compute top compatible matches in real-time as fields are filled.
        </p>
      </div>

      <ProfileForm isPublic={false} />
    </div>
  );
}
