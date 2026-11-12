'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '../brand/BrandLogo';
import { store } from '@/lib/db/store';
import { useLanguage } from '@/lib/useLanguage';
import { 
  LayoutDashboard, 
  Boxes, 
  UserPlus, 
  Sparkles, 
  Star, 
  Inbox, 
  HeartHandshake, 
  Receipt, 
  BarChart3, 
  FileSpreadsheet, 
  History, 
  Settings, 
  Copy, 
  Share2, 
  Check, 
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export function DashboardSidebar() {
  const pathname = usePathname();
  const { tr } = useLanguage();
  const [pendingCount, setPendingCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [collapsed, setCollapsed] = useState(false);
  const [regEnabled, setRegEnabled] = useState(true);

  useEffect(() => {
    const update = () => {
      setPendingCount(store.getPendingRequests().length);
      setCurrentUser(store.getCurrentUser());
      setRegEnabled(store.getSettings().enableOnlineRegistrationLink !== false);
    };
    update();
    const unsub = store.subscribe(update);
    return unsub;
  }, []);

  interface NavItem {
    href: string;
    label: string;
    icon: any;
    badge?: number | null;
    isPremium?: boolean;
    adminOnly?: boolean;
  }

  interface NavGroup {
    group: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      group: tr('STOCK & INVENTORY', 'اسٹاک اور انوینٹری'),
      items: [
        {
          href: '/dashboard',
          label: tr('Dashboard', 'ڈیش بورڈ'),
          icon: LayoutDashboard,
        },
        {
          href: '/inventory',
          label: tr('Rishta Inventory', 'رشتہ انوینٹری'),
          icon: Boxes,
        },
        {
          href: '/profiles/new',
          label: tr('+ Add Rishta', '+ نیا رشتہ درج کریں'),
          icon: UserPlus,
        },
        {
          href: '/matches',
          label: tr('Match Central', 'میچ سینٹرل'),
          icon: Sparkles,
        },
        {
          href: '/premium',
          label: tr('Premium Rishtay', 'پریمیم رشتے'),
          icon: Star,
          isPremium: true,
        },
      ]
    },
    {
      group: tr('PROPOSALS & INBOX', 'تجاویز اور درخواستیں'),
      items: [
        {
          href: '/requests',
          label: tr('Online Requests', 'آن لائن درخواستیں'),
          icon: Inbox,
          badge: pendingCount > 0 ? pendingCount : null,
        },
        {
          href: '/proposals',
          label: tr('Proposals Log', 'تجاویز کا ریکارڈ'),
          icon: HeartHandshake,
        },
      ]
    },
    {
      group: tr('FINANCE & BILLING', 'فیس اور بلنگ'),
      items: [
        {
          href: '/invoices',
          label: tr('Invoices & Payments', 'رسیدیں اور ادائیگیاں'),
          icon: Receipt,
        },
      ]
    },
    {
      group: tr('ERP TOOLS', 'دفتری ٹولز'),
      items: [
        {
          href: '/reports',
          label: tr('Reports & Analytics', 'رپورٹس اور تجزیات'),
          icon: BarChart3,
        },
        {
          href: '/import-export',
          label: tr('Import / Export', 'امپورٹ / ایکسپورٹ'),
          icon: FileSpreadsheet,
        },
        {
          href: '/activity',
          label: tr('Activity Ledger', 'سرگرمیوں کا ریکارڈ'),
          icon: History,
        },
        {
          href: '/settings',
          label: tr('Bureau Settings', 'بیورو سیٹنگز'),
          icon: Settings,
          adminOnly: true,
        },
      ]
    }
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
    <aside 
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-[#800F2F] text-[#F8F5F0] flex flex-col shrink-0 min-h-screen border-r border-[#660A22] shadow-xl no-print select-none transition-all duration-200`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-[#660A22] flex flex-col items-center text-center relative">
        <Link href="/dashboard" className="group flex items-center justify-center">
          {collapsed ? (
            <BrandLogo variant="icon" width={44} height={44} priority />
          ) : (
            <div className="flex flex-col items-center">
              <BrandLogo variant="full" width={140} height={140} priority />
              <span className="text-[9px] tracking-widest text-[#D4AF37] uppercase font-serif mt-1 font-semibold">
                {tr('Rishta ERP & Inventory', 'رشتہ ای آر پی اور انوینٹری')}
              </span>
            </div>
          )}
        </Link>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute end-2 top-3 p-1 rounded hover:bg-[#660A22] text-[#D4AF37] transition-colors"
          title={collapsed ? tr('Expand sidebar', 'سائیڈبار کھولیں') : tr('Collapse sidebar', 'سائیڈبار بند کریں')}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Add CTA (when expanded) */}
      {!collapsed && (
        <div className="p-3 border-b border-[#660A22]">
          <Link
            href="/profiles/new"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#D4AF37] hover:bg-[#F0D58A] text-[#660A22] font-bold text-xs uppercase tracking-wider shadow-sm transition-all border border-[#B88B22]"
          >
            <UserPlus className="w-4 h-4 text-[#660A22]" />
            <span>{tr('+ Add New Rishta', '+ نیا رشتہ درج کریں')}</span>
          </Link>
        </div>
      )}

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {navGroups.map((grp, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <span className="text-[9px] font-bold tracking-wider uppercase text-[#D4AF37]/60 px-3 block mb-1">
                {grp.group}
              </span>
            )}
            {grp.items.map(item => {
              if (item.adminOnly && !isAdmin) return null;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center ${
                    collapsed ? 'justify-center py-2.5 px-0' : 'justify-between px-3 py-2'
                  } rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#660A22] text-[#D4AF37] font-semibold border-s-4 border-[#D4AF37] shadow-sm'
                      : 'text-[#F8F5F0] hover:bg-[#660A22]/60 hover:text-[#D4AF37]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#D4AF37]' : item.isPremium ? 'text-[#D4AF37]' : 'text-[#E5DFD5]'
                      }`}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </div>

                  {!collapsed && item.badge !== null && item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#D4AF37] text-[#660A22]">
                      {item.badge}
                    </span>
                  )}

                  {!collapsed && item.isPremium && (
                    <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Online Form Share Tools (when expanded) */}
      {!collapsed && (
        <div className="px-3 py-2.5 border-t border-[#660A22] bg-[#660A22]/40 space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="tracking-wider uppercase text-[#E5DFD5] font-semibold">
              {tr('Online Form Link', 'آن لائن فارم لنک')}
            </span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded ${regEnabled ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-[#A3182E]/40 text-[#E5DFD5]'}`}>
              {regEnabled ? tr('Active', 'فعال') : tr('Paused', 'معطل')}
            </span>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={copyRegistrationLink}
              type="button"
              className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded text-xs bg-[#800F2F] hover:bg-[#96163A] text-[#E5DFD5] border border-[#D4AF37]/30 transition-colors"
              title={tr('Copy Public Registration Form Link', 'آن لائن فارم لنک کاپی کریں')}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-[#D4AF37]" />
                  <span className="text-[#D4AF37] font-bold text-[11px]">{tr('Copied!', 'کاپی ہو گیا!')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#D4AF37]" />
                  <span className="text-[11px]">{tr('Copy Link', 'لنک کاپی کریں')}</span>
                </>
              )}
            </button>

            <button
              onClick={shareFormWhatsApp}
              type="button"
              className="p-1 rounded bg-[#800F2F] hover:bg-[#96163A] text-[#D4AF37] border border-[#D4AF37]/30 transition-colors"
              title="Share Registration Form on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <Link
              href="/register"
              target="_blank"
              className="p-1 rounded bg-[#800F2F] hover:bg-[#96163A] text-[#E5DFD5] border border-[#D4AF37]/30 transition-colors"
              title="Open Online Form in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Current User Card */}
      <div className={`p-2.5 border-t border-[#660A22] bg-[#52061A] flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-7 h-7 rounded-full bg-[#800F2F] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-serif font-bold text-xs shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0) : 'K'}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-[#F8F5F0] truncate leading-tight">
                {currentUser?.name || 'Staff User'}
              </p>
              <span className="inline-flex items-center gap-1 text-[9px] text-[#D4AF37] capitalize">
                <Shield className="w-2.5 h-2.5" />
                {currentUser?.role || 'staff'}
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <Link
            href="/login"
            className="p-1.5 text-[#E5DFD5] hover:text-[#D4AF37] transition-colors"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </aside>
  );
}
