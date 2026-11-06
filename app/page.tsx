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
    <div className="min-h-screen bg-[#800F2F] flex items-center justify-center text-[#F8F5F0]">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-serif text-sm tracking-wider text-[#E5DFD5]">
          Loading Kiran Marriage Bureau ERP...
        </p>
      </div>
    </div>
  );
}
