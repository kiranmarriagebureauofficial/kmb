import React from 'react';
import Link from 'next/link';
import { requireServerSessionUser } from '@/lib/server/auth-helpers';
import { TeamManagementPanel } from '@/components/admin/TeamManagementPanel';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default async function AdminUsersPage() {
  const user = await requireServerSessionUser();

  if (user.role !== 'admin') {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 bg-[#FFFFFF] border-2 border-[#A3182E] rounded-2xl text-center space-y-4 shadow-md">
        <ShieldAlert className="w-12 h-12 text-[#A3182E] mx-auto" />
        <h1 className="font-serif text-xl font-bold text-[#800F2F]">
          Administrator Access Required / صرف ایڈمن کے لیے
        </h1>
        <p className="text-xs text-[#6E6466]">
          Only the Bureau Administrator can create, approve, or manage team user accounts.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#800F2F] text-[#F8F5F0] text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <TeamManagementPanel />
    </div>
  );
}

