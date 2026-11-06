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
    <header className="h-16 bg-[#FFFFFF] border-b border-[#E5DFD5] px-6 flex items-center justify-between no-print z-30">
      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
        <div className="relative">
          <Search className="w-4 h-4 text-[#6E6466] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, form no, city, caste..."
            className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-[#F8F5F0] border border-[#E5DFD5] focus:border-[#D4AF37] focus:outline-none text-[#2C2526] placeholder-[#6E6466]"
          />
        </div>
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Add Buttons */}
        <Link
          href="/profiles/new"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#800F2F] text-[#F8F5F0] hover:bg-[#660A22] transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Add Rishta</span>
        </Link>

        <Link
          href="/invoices?new=1"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FFFFFF] text-[#800F2F] border border-[#800F2F] hover:bg-[#F8F5F0] transition-colors"
        >
          <Receipt className="w-3.5 h-3.5 text-[#800F2F]" />
          <span>New Invoice</span>
        </Link>

        {/* Language switch */}
        <LanguageToggle variant="ivory" />

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 py-1 px-2.5 rounded-lg border border-[#E5DFD5] hover:border-[#D4AF37] bg-[#FFFFFF] text-xs transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-[#800F2F] text-[#D4AF37] font-serif font-bold flex items-center justify-center text-xs">
              {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
            </div>
            <div className="text-left hidden md:block">
              <p className="font-semibold text-[#2C2526] leading-tight">
                {currentUser?.name || 'Admin'}
              </p>
              <span className="text-[10px] text-[#B88B22] font-medium uppercase">
                {currentUser?.role || 'admin'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-[#6E6466]" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg bg-[#FFFFFF] border border-[#E5DFD5] shadow-lg py-2 z-50">
              <div className="px-3 py-1.5 border-b border-[#E5DFD5] mb-1">
                <span className="text-[10px] uppercase font-bold text-[#6E6466] tracking-wider">
                  Switch Active Role (Demo)
                </span>
              </div>
              {staffMembers.map(staff => (
                <button
                  key={staff.id}
                  onClick={() => switchUser(staff.id)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#F8F5F0] transition-colors ${
                    currentUser?.id === staff.id ? 'font-bold text-[#800F2F] bg-[#F8F5F0]' : 'text-[#2C2526]'
                  }`}
                >
                  <div>
                    <p>{staff.name}</p>
                    <span className="text-[10px] text-[#6E6466] uppercase tracking-wide">
                      {staff.role}
                    </span>
                  </div>
                  {currentUser?.id === staff.id && (
                    <UserCheck className="w-4 h-4 text-[#D4AF37]" />
                  )}
                </button>
              ))}
              <div className="border-t border-[#E5DFD5] mt-2 pt-1">
                <Link
                  href="/login"
                  className="w-full block px-3 py-1.5 text-xs text-[#A3182E] hover:bg-[#F8F5F0]"
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

