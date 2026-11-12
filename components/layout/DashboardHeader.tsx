'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { store } from '@/lib/db/store';
import type { StaffUser } from '@/lib/types';
import { useLanguage } from '@/lib/useLanguage';
import { LanguageToggle } from '../brand/LanguageToggle';
import { Search, Plus, Receipt, Shield, ChevronDown, LogOut, Users, KeyRound } from 'lucide-react';

export function DashboardHeader({ initialUser }: { initialUser?: StaffUser | null }) {
  const router = useRouter();
  const { tr } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(initialUser ?? store.getCurrentUser());
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (initialUser) {
      setCurrentUser(initialUser);
    }
    const unsub = store.subscribe(() => {
      const stored = store.getCurrentUser();
      if (stored) setCurrentUser(stored);
    });
    return unsub;
  }, [initialUser]);

  const isAdmin = currentUser?.role === 'admin';
  const canAddEdit = isAdmin || currentUser?.permissions?.canAddEditData !== false;
  const canInvoices = isAdmin || currentUser?.permissions?.canManageInvoices === true;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/profiles?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      store.setCurrentUser(null);
      setUserDropdownOpen(false);
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <header className="h-16 bg-[#FFFFFF] border-b border-[#E5DFD5] px-6 flex items-center justify-between no-print z-30">
      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
        <div className="relative">
          <Search className="w-4 h-4 text-[#6E6466] absolute start-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={tr('Search by name, phone, form no, city, caste...', 'نام، فون، فارم نمبر، شہر یا ذات سے تلاش کریں...')}
            className="w-full ps-9 pe-4 py-2 rounded-lg text-xs bg-[#F8F5F0] border border-[#E5DFD5] focus:border-[#D4AF37] focus:outline-none text-[#2C2526] placeholder-[#6E6466]"
          />
        </div>
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {canAddEdit && (
          <Link
            href="/profiles/new"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#800F2F] text-[#F8F5F0] hover:bg-[#660A22] transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{tr('Add Rishta', 'نیا رشتہ')}</span>
          </Link>
        )}

        {canInvoices && (
          <Link
            href="/invoices?new=1"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FFFFFF] text-[#800F2F] border border-[#800F2F] hover:bg-[#F8F5F0] transition-colors"
          >
            <Receipt className="w-3.5 h-3.5 text-[#800F2F]" />
            <span>{tr('New Invoice', 'نئی رسید')}</span>
          </Link>
        )}

        {/* Language switch */}
        <LanguageToggle variant="ivory" />

        {/* Authenticated User Menu (No role-switching bypass) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 py-1 px-2.5 rounded-lg border border-[#E5DFD5] hover:border-[#D4AF37] bg-[#FFFFFF] text-xs transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-[#800F2F] text-[#D4AF37] font-serif font-bold flex items-center justify-center text-xs">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-start hidden md:block">
              <p className="font-semibold text-[#2C2526] leading-tight">
                {currentUser?.name || tr('User', 'صارف')}
              </p>
              <span className="text-[10px] text-[#B88B22] font-medium uppercase">
                {currentUser?.role === 'admin' ? tr('Admin', 'ایڈمن') : tr('Team Member', 'ٹیم ممبر')}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#6E6466]" />
          </button>

          {userDropdownOpen && (
            <div className="absolute end-0 mt-2 w-64 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-xl py-2 z-50 text-xs">
              <div className="px-3.5 py-2 border-b border-[#E5DFD5] space-y-0.5">
                <p className="font-bold text-[#800F2F] truncate">{currentUser?.name}</p>
                <p className="text-[11px] text-[#6E6466] truncate" dir="ltr">{currentUser?.email}</p>
                <div className="pt-1 flex flex-wrap gap-1">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#800F2F] text-[#D4AF37] text-[10px] font-bold">
                    <Shield className="w-2.5 h-2.5" />
                    {isAdmin ? tr('Administrator', 'ایڈمنسٹریٹر') : tr('Approved Staff', 'منظور شدہ عملہ')}
                  </span>
                </div>
              </div>

              {isAdmin && (
                <div className="py-1 border-b border-[#E5DFD5]">
                  <Link
                    href="/users"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-[#2C2526] hover:bg-[#F8F5F0] hover:text-[#800F2F] transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{tr('Manage & Approve Users', 'یوزرز اور منظوری کنٹرول')}</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-[#2C2526] hover:bg-[#F8F5F0] hover:text-[#800F2F] transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#800F2F]" />
                    <span>{tr('Admin ID & Settings', 'ایڈمن آئی ڈی اور سیٹنگز')}</span>
                  </Link>
                </div>
              )}

              <div className="pt-1">
                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-start text-[#A3182E] font-semibold hover:bg-[#F8F5F0] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{loggingOut ? tr('Signing out...', 'لاگ آؤٹ ہو رہا ہے...') : tr('Sign Out', 'لاگ آؤٹ کریں')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
