'use client';

import React from 'react';
import { ProfileForm } from '@/components/profiles/ProfileForm';

export default function NewProfilePage() {
  return (
    <div className="space-y-6">
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5DFD5] shadow-sm">
        <span className="text-[11px] uppercase font-serif font-bold tracking-widest text-[#B88B22]">
          Staff Registration Intake
        </span>
        <h1 className="font-serif text-2xl font-bold text-[#800F2F] mt-0.5">
          Add New Rishta Profile
        </h1>
        <p className="text-xs text-[#6E6466]">
          Matches the official paper registration form. Live side panel will compute top compatible matches in real-time as fields are filled.
        </p>
      </div>

      <ProfileForm isPublic={false} />
    </div>
  );
}

