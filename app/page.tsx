'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { store } from '@/lib/db/store';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = store.getCurrentUser();
    if (user && user.active) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#5A0A14] flex items-center justify-center text-[#FBF4E6]">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-[#D9A93F] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-serif text-sm tracking-wider text-[#E9DDC3]">
          Loading Kiran Marriage Bureau ERP...
        </p>
      </div>
    </div>
  );
}
