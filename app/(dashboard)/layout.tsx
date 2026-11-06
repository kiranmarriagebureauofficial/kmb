import React, { Suspense } from 'react';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#F8F5F0] text-[#2C2526]">
      {/* Deep Maroon Sidebar */}
      <Suspense fallback={<div className="w-64 bg-[#800F2F] min-h-screen shrink-0" />}>
        <DashboardSidebar />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Suspense fallback={<div className="h-16 bg-[#FFFFFF]" />}>
          <DashboardHeader />
        </Suspense>
        <main className="flex-1 p-6 overflow-y-auto">
          <Suspense fallback={<div className="p-8 text-xs text-[#6E6466]">Loading page content...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
