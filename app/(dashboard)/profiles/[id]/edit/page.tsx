'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { store } from '@/lib/db/store';
import { Profile } from '@/lib/types';
import { ProfileForm } from '@/components/profiles/ProfileForm';

export default function EditProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [profile, setProfile] = useState<Profile | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const p = store.getProfileById(id);
      setProfile(p);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-[#7B5E5E]">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="font-serif text-xl font-bold text-[#5A0A14]">
          Profile Not Found
        </h2>
        <button
          onClick={() => router.push('/profiles')}
          className="text-xs text-[#5A0A14] underline font-semibold"
        >
          Return to All Rishtas
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#FFFDF8] p-5 rounded-2xl border border-[#E9DDC3] shadow-sm">
        <span className="text-[11px] uppercase font-serif font-bold tracking-widest text-[#B08626]">
          Edit Client Information
        </span>
        <h1 className="font-serif text-2xl font-bold text-[#5A0A14] mt-0.5">
          Editing Profile: {profile.name} ({profile.formNo})
        </h1>
        <p className="text-xs text-[#7B5E5E]">
          Update details, qualifications, or partner preferences. The live side panel evaluates matches dynamically.
        </p>
      </div>

      <ProfileForm initialData={profile} isPublic={false} />
    </div>
  );
}
