'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '../brand/BrandLogo';
import { store } from '@/lib/db/store';
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
      group: 'STOCK & INVENTORY',
      items: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          href: '/inventory',
          label: 'Rishta Inventory',
          icon: Boxes,
        },
        {
          href: '/profiles/new',
          label: '+ Add Rishta',
          icon: UserPlus,
        },
        {
          href: '/matches',
          label: 'Match Central',
          icon: Sparkles,
        },
        {
          href: '/premium',
          label: 'Premium Rishtay',
          icon: Star,
          isPremium: true,
        },
      ]
    },
    {
      group: 'PROPOSALS & INBOX',
      items: [
        {
          href: '/requests',
          label: 'Online Requests',
          icon: Inbox,
          badge: pendingCount > 0 ? pendingCount : null,
        },
        {
          href: '/proposals',
          label: 'Proposals Log',
          icon: HeartHandshake,
        },
      ]
    },
    {
      group: 'FINANCE & BILLING',
      items: [
        {
          href: '/invoices',
          label: 'Invoices & Payments',
          icon: Receipt,
        },
      ]
    },
    {
      group: 'ERP TOOLS',
      items: [
        {
          href: '/reports',
          label: 'Reports & Analytics',
          icon: BarChart3,
        },
        {
          href: '/import-export',
          label: 'Import / Export',
          icon: FileSpreadsheet,
        },
        {
          href: '/activity',
          label: 'Activity Ledger',
          icon: History,
        },
        {
          href: '/settings',
          label: 'Bureau Settings',
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
      } bg-[#5A0A14] text-[#FBF4E6] flex flex-col shrink-0 min-h-screen border-r border-[#420610] shadow-xl no-print select-none transition-all duration-200`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-[#420610] flex flex-col items-center text-center relative">
        <Link href="/dashboard" className="group flex items-center justify-center">
          {collapsed ? (
            <BrandLogo variant="icon" width={44} height={44} priority />
          ) : (
            <div className="flex flex-col items-center">
              <BrandLogo variant="full" width={140} height={140} priority />
              <span className="text-[9px] tracking-widest text-[#D9A93F] uppercase font-serif mt-1 font-semibold">
                Rishta ERP & Inventory
              </span>
            </div>
          )}
        </Link>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute right-2 top-3 p-1 rounded hover:bg-[#420610] text-[#D9A93F] transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Add CTA (when expanded) */}
      {!collapsed && (
        <div className="p-3 border-b border-[#420610]">
          <Link
            href="/profiles/new"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#D9A93F] hover:bg-[#EBCB7C] text-[#420610] font-bold text-xs uppercase tracking-wider shadow-sm transition-all border border-[#B08626]"
          >
            <UserPlus className="w-4 h-4 text-[#420610]" />
            <span>+ Add New Rishta</span>
          </Link>
        </div>
      )}

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {navGroups.map((grp, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <span className="text-[9px] font-bold tracking-wider uppercase text-[#D9A93F]/60 px-3 block mb-1">
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
                      ? 'bg-[#420610] text-[#D9A93F] font-semibold border-l-4 border-[#D9A93F] shadow-sm'
                      : 'text-[#FBF4E6] hover:bg-[#420610]/60 hover:text-[#D9A93F]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#D9A93F]' : item.isPremium ? 'text-[#D9A93F]' : 'text-[#E9DDC3]'
                      }`}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </div>

                  {!collapsed && item.badge !== null && item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#D9A93F] text-[#420610]">
                      {item.badge}
                    </span>
                  )}

                  {!collapsed && item.isPremium && (
                    <Star className="w-3 h-3 fill-[#D9A93F] text-[#D9A93F]" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Online Form Share Tools (when expanded) */}
      {!collapsed && (
        <div className="px-3 py-2.5 border-t border-[#420610] bg-[#420610]/40 space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="tracking-wider uppercase text-[#E9DDC3] font-semibold">
              Online Form Link
            </span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded ${regEnabled ? 'bg-[#D9A93F]/20 text-[#D9A93F]' : 'bg-[#8E1B2B]/40 text-[#E9DDC3]'}`}>
              {regEnabled ? 'Active' : 'Paused'}
            </span>
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={copyRegistrationLink}
              type="button"
              className="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded text-xs bg-[#5A0A14] hover:bg-[#7A1424] text-[#E9DDC3] border border-[#D9A93F]/30 transition-colors"
              title="Copy Public Registration Form Link"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-[#D9A93F]" />
                  <span className="text-[#D9A93F] font-bold text-[11px]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#D9A93F]" />
                  <span className="text-[11px]">Copy Link</span>
                </>
              )}
            </button>

            <button
              onClick={shareFormWhatsApp}
              type="button"
              className="p-1 rounded bg-[#5A0A14] hover:bg-[#7A1424] text-[#D9A93F] border border-[#D9A93F]/30 transition-colors"
              title="Share Registration Form on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <Link
              href="/register"
              target="_blank"
              className="p-1 rounded bg-[#5A0A14] hover:bg-[#7A1424] text-[#E9DDC3] border border-[#D9A93F]/30 transition-colors"
              title="Open Online Form in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Current User Card */}
      <div className={`p-2.5 border-t border-[#420610] bg-[#32040B] flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-7 h-7 rounded-full bg-[#5A0A14] border border-[#D9A93F] flex items-center justify-center text-[#D9A93F] font-serif font-bold text-xs shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0) : 'K'}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-[#FBF4E6] truncate leading-tight">
                {currentUser?.name || 'Staff User'}
              </p>
              <span className="inline-flex items-center gap-1 text-[9px] text-[#D9A93F] capitalize">
                <Shield className="w-2.5 h-2.5" />
                {currentUser?.role || 'staff'}
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <Link
            href="/login"
            className="p-1.5 text-[#E9DDC3] hover:text-[#D9A93F] transition-colors"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </aside>
  );
}
