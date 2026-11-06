'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '../brand/BrandLogo';
import { store } from '@/lib/db/store';
import { 
  LayoutDashboard, 
  Users, 
  Star, 
  Inbox, 
  HeartHandshake, 
  Receipt, 
  Settings, 
  UserPlus, 
  Copy, 
  Share2, 
  Check, 
  ExternalLink,
  LogOut,
  Shield,
  UserCheck
} from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/utils';

export function DashboardSidebar() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());

  useEffect(() => {
    const update = () => {
      setPendingCount(store.getPendingRequests().length);
      setCurrentUser(store.getCurrentUser());
    };
    update();
    const unsub = store.subscribe(update);
    return unsub;
  }, []);

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/profiles',
      label: 'All Rishtas',
      icon: Users,
    },
    {
      href: '/requests',
      label: 'Online Requests',
      icon: Inbox,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      href: '/premium',
      label: 'Premium Rishtay',
      icon: Star,
      isPremium: true,
    },
    {
      href: '/proposals',
      label: 'Proposals Log',
      icon: HeartHandshake,
    },
    {
      href: '/invoices',
      label: 'Fee & Invoices',
      icon: Receipt,
    },
    {
      href: '/settings',
      label: 'Admin Settings',
      icon: Settings,
      adminOnly: true,
    },
  ];

  const copyRegistrationLink = () => {
    const url = `${window.location.origin}/register`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareFormWhatsApp = () => {
    const url = `${window.location.origin}/register`;
    const message = `*Kiran Marriage Bureau (Lahore)*\nPlease fill out your marriage profile online for confidential match-making:\n${url}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <aside className="w-64 bg-[#5A0A14] text-[#FBF4E6] flex flex-col shrink-0 min-h-screen border-r border-[#420610] shadow-xl no-print select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#420610] flex flex-col items-center text-center">
        <Link href="/dashboard" className="group">
          <BrandLogo variant="banner" width={220} height={60} priority />
        </Link>
        <span className="text-[10px] tracking-widest text-[#D9A93F] uppercase font-serif mt-1 font-semibold">
          Bureau Management System
        </span>
      </div>

      {/* Quick Add CTA */}
      <div className="p-4 border-b border-[#420610]">
        <Link
          href="/profiles/new"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#D9A93F] hover:bg-[#EBCB7C] text-[#420610] font-bold text-xs uppercase tracking-wider shadow-sm transition-all border border-[#B08626]"
        >
          <UserPlus className="w-4 h-4 text-[#420610]" />
          <span>+ Add New Rishta</span>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map(item => {
          if (item.adminOnly && !isAdmin) return null;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#420610] text-[#D9A93F] font-semibold border-l-4 border-[#D9A93F] shadow-sm'
                  : 'text-[#FBF4E6] hover:bg-[#420610]/60 hover:text-[#D9A93F]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#D9A93F]' : item.isPremium ? 'text-[#D9A93F]' : 'text-[#E9DDC3]'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== null && item.badge !== undefined && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#D9A93F] text-[#420610]">
                  {item.badge}
                </span>
              )}

              {item.isPremium && (
                <Star className="w-3.5 h-3.5 fill-[#D9A93F] text-[#D9A93F]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Online Form Share Tools */}
      <div className="px-4 py-3 border-t border-[#420610] bg-[#420610]/40 space-y-2">
        <span className="text-[10px] tracking-wider uppercase text-[#E9DDC3] font-semibold block">
          Client Registration Link
        </span>
        <div className="flex gap-2">
          <button
            onClick={copyRegistrationLink}
            type="button"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs bg-[#5A0A14] hover:bg-[#7A1424] text-[#E9DDC3] border border-[#D9A93F]/30 transition-colors"
            title="Copy Public Registration Form Link"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#D9A93F]" />
                <span className="text-[#D9A93F] font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-[#D9A93F]" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            onClick={shareFormWhatsApp}
            type="button"
            className="p-1.5 rounded bg-[#5A0A14] hover:bg-[#7A1424] text-[#D9A93F] border border-[#D9A93F]/30 transition-colors"
            title="Share Registration Form on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Current User Card */}
      <div className="p-3 border-t border-[#420610] bg-[#32040B] flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-[#5A0A14] border border-[#D9A93F] flex items-center justify-center text-[#D9A93F] font-serif font-bold text-xs shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0) : 'K'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-[#FBF4E6] truncate">
              {currentUser?.name || 'Staff User'}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-[#D9A93F] capitalize">
              <Shield className="w-2.5 h-2.5" />
              {currentUser?.role || 'staff'}
            </span>
          </div>
        </div>

        <Link
          href="/"
          target="_blank"
          className="p-1.5 text-[#E9DDC3] hover:text-[#D9A93F] transition-colors"
          title="Open Public Website"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}
