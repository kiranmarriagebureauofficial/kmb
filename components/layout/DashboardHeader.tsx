'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { store } from '@/lib/db/store';
import { LanguageToggle } from '../brand/LanguageToggle';
import { Search, Plus, Receipt, UserCheck, Shield, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export function DashboardHeader() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const staffMembers = store.getStaff();

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
    });
    return unsub;
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/profiles?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const switchUser = (userId: string) => {
    const u = staffMembers.find(s => s.id === userId);
    if (u) {
      store.setCurrentUser(u);
    }
    setUserDropdownOpen(false);
  };

  return (
    <header className="h-16 bg-[#FFFDF8] border-b border-[#E9DDC3] px-6 flex items-center justify-between no-print z-30">
      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
        <div className="relative">
          <Search className="w-4 h-4 text-[#7B5E5E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, form no, city, caste..."
            className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-[#FBF4E6] border border-[#E9DDC3] focus:border-[#D9A93F] focus:outline-none text-[#2A0A0F] placeholder-[#7B5E5E]"
          />
        </div>
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Add Buttons */}
        <Link
          href="/profiles/new"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#5A0A14] text-[#FBF4E6] hover:bg-[#420610] transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-[#D9A93F]" />
          <span>Add Rishta</span>
        </Link>

        <Link
          href="/invoices?new=1"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FFFDF8] text-[#5A0A14] border border-[#5A0A14] hover:bg-[#FBF4E6] transition-colors"
        >
          <Receipt className="w-3.5 h-3.5 text-[#5A0A14]" />
          <span>New Invoice</span>
        </Link>

        {/* Language switch */}
        <LanguageToggle variant="ivory" />

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 py-1 px-2.5 rounded-lg border border-[#E9DDC3] hover:border-[#D9A93F] bg-[#FFFDF8] text-xs transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-[#5A0A14] text-[#D9A93F] font-serif font-bold flex items-center justify-center text-xs">
              {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
            </div>
            <div className="text-left hidden md:block">
              <p className="font-semibold text-[#2A0A0F] leading-tight">
                {currentUser?.name || 'Admin'}
              </p>
              <span className="text-[10px] text-[#B08626] font-medium uppercase">
                {currentUser?.role || 'admin'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#7B5E5E]" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg bg-[#FFFDF8] border border-[#E9DDC3] shadow-lg py-2 z-50">
              <div className="px-3 py-1.5 border-b border-[#E9DDC3] mb-1">
                <span className="text-[10px] uppercase font-bold text-[#7B5E5E] tracking-wider">
                  Switch Active Role (Demo)
                </span>
              </div>
              {staffMembers.map(staff => (
                <button
                  key={staff.id}
                  onClick={() => switchUser(staff.id)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#FBF4E6] transition-colors ${
                    currentUser?.id === staff.id ? 'font-bold text-[#5A0A14] bg-[#FBF4E6]' : 'text-[#2A0A0F]'
                  }`}
                >
                  <div>
                    <p>{staff.name}</p>
                    <span className="text-[10px] text-[#7B5E5E] uppercase tracking-wide">
                      {staff.role}
                    </span>
                  </div>
                  {currentUser?.id === staff.id && (
                    <UserCheck className="w-4 h-4 text-[#D9A93F]" />
                  )}
                </button>
              ))}
              <div className="border-t border-[#E9DDC3] mt-2 pt-1">
                <Link
                  href="/login"
                  className="w-full block px-3 py-1.5 text-xs text-[#8E1B2B] hover:bg-[#FBF4E6]"
                >
                  Sign Out / Relogin
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
