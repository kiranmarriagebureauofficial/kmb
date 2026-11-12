'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { store } from '@/lib/db/store';
import { Profile } from '@/lib/types';
import { ProfileForm } from '@/components/profiles/ProfileForm';
import { useLanguage } from '@/lib/useLanguage';

function EditProfileContent() {
  const { tr } = useLanguage();
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
        {tr('Loading profile...', 'پروفائل لوڈ ہو رہی ہے...')}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="font-serif text-xl font-bold text-[#800F2F]">
          {tr('Profile Not Found', 'پروفائل نہیں ملی')}
        </h2>
        <button
          onClick={() => router.push('/profiles')}
          className="text-xs text-[#800F2F] underline font-semibold"
        >
          {tr('Return to All Rishtas', 'تمام رشتوں پر واپس جائیں')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5DFD5] shadow-sm">
        <span className="text-[11px] uppercase font-serif font-bold tracking-widest text-[#B88B22]">
          {tr('Edit Client Information', 'کلائنٹ کی معلومات میں ترمیم')}
        </span>
        <h1 className="font-serif text-2xl font-bold text-[#800F2F] mt-0.5">
          {tr('Editing Profile:', 'پروفائل ترمیم:')} {profile.name} ({profile.formNo})
        </h1>
        <p className="text-xs text-[#6E6466]">
          {tr(
            'Update details, qualifications, or partner preferences. The live side panel evaluates matches dynamically.',
            'تفصیلات، تعلیم یا شریک حیات کی ترجیحات اپ ڈیٹ کریں۔ لائیو سائیڈ پینل خودکار طور پر میچز اپ ڈیٹ کرتا ہے۔'
          )}
        </p>
      </div>

      <ProfileForm initialData={profile} isPublic={false} />
    </div>
  );
}

export default function EditProfilePage() {
  const { tr } = useLanguage();
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#6E6466]">{tr('Loading editor...', 'ایڈیٹر لوڈ ہو رہا ہے...')}</div>}>
      <EditProfileContent />
    </Suspense>
  );
}
