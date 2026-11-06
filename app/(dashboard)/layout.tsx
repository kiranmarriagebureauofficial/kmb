import React, { Suspense } from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#FBF4E6] text-[#2A0A0F]">
      {/* Deep Maroon Sidebar */}
      <Suspense fallback={<div className="w-64 bg-[#5A0A14] min-h-screen shrink-0" />}>
        <DashboardSidebar />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Suspense fallback={<div className="h-16 bg-[#FFFDF8]" />}>
          <DashboardHeader />
        </Suspense>
        <main className="flex-1 p-6 overflow-y-auto">
          <Suspense fallback={<div className="p-8 text-xs text-[#7B5E5E]">Loading page content...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
