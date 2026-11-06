'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { store } from '@/lib/db/store';
import { Profile } from '@/lib/types';
import { ProfileForm } from '@/components/profiles/ProfileForm';

function EditProfileContent() {
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
      <div className="p-8 text-center text-xs text-[#6E6466]">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="font-serif text-xl font-bold text-[#800F2F]">
          Profile Not Found
        </h2>
        <button
          onClick={() => router.push('/profiles')}
          className="text-xs text-[#800F2F] underline font-semibold"
        >
          Return to All Rishtas
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5DFD5] shadow-sm">
        <span className="text-[11px] uppercase font-serif font-bold tracking-widest text-[#B88B22]">
          Edit Client Information
        </span>
        <h1 className="font-serif text-2xl font-bold text-[#800F2F] mt-0.5">
          Editing Profile: {profile.name} ({profile.formNo})
        </h1>
        <p className="text-xs text-[#6E6466]">
          Update details, qualifications, or partner preferences. The live side panel evaluates matches dynamically.
        </p>
      </div>

      <ProfileForm initialData={profile} isPublic={false} />
    </div>
  );
}

export default function EditProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#6E6466]">Loading editor...</div>}>
      <EditProfileContent />
    </Suspense>
  );
}
