'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { store } from '@/lib/db/store';
import { useLanguage } from '@/lib/useLanguage';
import { Profile, Invoice, Proposal } from '@/lib/types';
import { formatPKR, formatDate, calculateDaysInStock, getAgeBucket, getAgeBucketLabel } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Boxes, 
  Inbox, 
  Star, 
  HeartHandshake, 
  Receipt, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Plus, 
  Copy, 
  Check, 
  ArrowRight,
  AlertCircle,
  Sparkles,
  Phone,
  Eye,
  FileSpreadsheet
} from 'lucide-react';

function DashboardContent() {
  const { tr } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      setProfiles(store.getProfiles());
      setInvoices(store.getInvoices());
      setProposals(store.getProposals());
    };
    update();
    const unsub = store.subscribe(update);
    return unsub;
  }, []);

  // Inventory stats
  const stats = useMemo(() => {
    return store.getInventoryStats();
  }, [profiles, invoices, proposals]);

  // Old stock profiles (91+ days)
  const oldStockList = useMemo(() => {
    return store.getOldStockProfiles(91).slice(0, 5);
  }, [profiles]);

  // Recently added profiles (5 latest)
  const recentStockList = useMemo(() => {
    return [...profiles]
      .sort((a, b) => new Date(b.entryDate || b.createdAt).getTime() - new Date(a.entryDate || a.createdAt).getTime())
      .slice(0, 5);
  }, [profiles]);

  const copyRegLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/register`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Operations Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-5 rounded-xl border border-[#E5DFD5] shadow-xs">
        <div>
          <span className="text-[10px] uppercase font-serif font-bold tracking-widest text-[#B88B22]">
            {tr('Bureau Operations Control & ERP Ledger', 'بیورو آپریشنز کنٹرول اور ای آر پی لیجر')}
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#800F2F] mt-0.5">
            {tr('Rishta Stock & Matchmaking Central', 'رشتہ اسٹاک اور میچ میکنگ سینٹرل')}
          </h1>
          <p className="text-xs text-[#6E6466]">
            {tr('Verified matchmaking, real-time compatibility audit, and fee management for Lahore.', 'لاہور کے لیے تصدیق شدہ میچ میکنگ، لائیو مطابقت اور فیس کا نظام۔')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/profiles/new">
            <Button size="sm" variant="primary" icon={<Plus className="w-3.5 h-3.5 text-[#D4AF37]" />}>
              {tr('Add Rishta', 'نیا رشتہ درج کریں')}
            </Button>
          </Link>

          <Button
            size="sm"
            variant="secondary"
            onClick={copyRegLink}
            icon={copied ? <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Copy className="w-3.5 h-3.5 text-[#800F2F]" />}
          >
            {copied ? tr('Link Copied!', 'لنک کاپی ہو گیا!') : tr('Copy Online Form Link', 'آن لائن فارم لنک کاپی کریں')}
          </Button>

          <Link href="/invoices?new=1">
            <Button size="sm" variant="accent" icon={<Receipt className="w-3.5 h-3.5 text-[#800F2F]" />}>
              {tr('New Invoice', 'نئی رسید')}
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Tiles (Dense ERP Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {/* Tile 1: Total Stock */}
        <Link
          href="/inventory?status=available"
          className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E5DFD5] shadow-xs hover:border-[#D4AF37] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6466]">
              {tr('Total Available Stock', 'موجودہ دستیاب رشتے')}
            </span>
            <Boxes className="w-4 h-4 text-[#800F2F] group-hover:text-[#D4AF37]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#800F2F]">
              {stats.totalStock}
            </span>
            <span className="text-xs text-[#6E6466] font-medium">
              ({stats.maleStock}{tr('M', 'مرد')} / {stats.femaleStock}{tr('F', 'خواتین')})
            </span>
          </div>
          <span className="text-[10px] text-[#B88B22] font-medium mt-1 block">
            {tr('Click to inspect active inventory →', 'انوینٹری دیکھنے کے لیے کلک کریں ←')}
          </span>
        </Link>

        {/* Tile 2: New This Week / Month */}
        <Link
          href="/inventory?bucket=new"
          className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E5DFD5] shadow-xs hover:border-[#D4AF37] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6466]">
              {tr('New Arrivals (0-7d)', 'نئے آنے والے رشتے (0-7 دن)')}
            </span>
            <Clock className="w-4 h-4 text-[#800F2F] group-hover:text-[#D4AF37]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#800F2F]">
              {stats.newThisWeek}
            </span>
            <span className="text-xs text-[#6E6466]">
              +{stats.newThisMonth} {tr('this month', 'اس ماہ')}
            </span>
          </div>
          <span className="text-[10px] text-[#B88B22] font-medium mt-1 block">
            {tr('View recent intake →', 'حالیہ اندراجات دیکھیں ←')}
          </span>
        </Link>

        {/* Tile 3: Old Stock Alert */}
        <Link
          href="/reports"
          className={`p-4 rounded-xl border shadow-xs transition-all group ${
            stats.totalOldStock > 0
              ? 'bg-[#FFFFFF] border-[#A3182E]/40 hover:border-[#A3182E]'
              : 'bg-[#FFFFFF] border-[#E5DFD5]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A3182E]">
              {tr('Old Stock Alert (91+d)', 'پرانا اسٹاک الرٹ (+91 دن)')}
            </span>
            <AlertCircle className="w-4 h-4 text-[#A3182E]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#A3182E]">
              {stats.totalOldStock}
            </span>
            <span className="text-xs text-[#6E6466]">
              ({stats.veryOldStock} {tr('stale 180d+', 'پرانے +180 دن')})
            </span>
          </div>
          <span className="text-[10px] text-[#A3182E] font-medium mt-1 block">
            {tr('Action required: follow-up →', 'توجہ درکار: فالو اپ کریں ←')}
          </span>
        </Link>

        {/* Tile 4: Premium Rishtay */}
        <Link
          href="/premium"
          className="p-4 bg-[#FFFFFF] rounded-xl border border-[#D4AF37] shadow-xs hover:border-[#B88B22] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B88B22] flex items-center gap-1">
              <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
              {tr('Premium Members', 'پریمیم ممبران')}
            </span>
            <Star className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#800F2F]">
              {stats.premiumProfilesCount}
            </span>
            <span className="text-xs text-[#D4AF37] font-bold">
              {tr('Priority matching', 'ترجیحی میچنگ')}
            </span>
          </div>
          <span className="text-[10px] text-[#B88B22] font-medium mt-1 block">
            {tr('Inspect VIP candidates →', 'وی آئی پی امیدوار دیکھیں ←')}
          </span>
        </Link>

        {/* Tile 5: Online Requests Inbox */}
        <Link
          href="/requests"
          className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E5DFD5] shadow-xs hover:border-[#D4AF37] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6466]">
              {tr('Pending Online Requests', 'زیرِ التواء آن لائن درخواستیں')}
            </span>
            <Inbox className="w-4 h-4 text-[#800F2F] group-hover:text-[#D4AF37]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#800F2F]">
              {stats.pendingRequestsCount}
            </span>
            <span className="text-xs text-[#6E6466]">
              {tr('Awaiting review', 'منظوری کے منتظر')}
            </span>
          </div>
          <span className="text-[10px] text-[#B88B22] font-medium mt-1 block">
            {tr('Review online submissions →', 'آن لائن درخواستیں چیک کریں ←')}
          </span>
        </Link>

        {/* Tile 6: Engaged & Married */}
        <Link
          href="/proposals"
          className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E5DFD5] shadow-xs hover:border-[#D4AF37] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6466]">
              {tr('Rishta Done & Engaged', 'مکمل و منگنی شدہ رشتے')}
            </span>
            <HeartHandshake className="w-4 h-4 text-[#800F2F] group-hover:text-[#D4AF37]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-[#800F2F]">
              {stats.finalizedRishtay}
            </span>
            <span className="text-xs text-[#6E6466]">
              {stats.engagedCount} {tr('currently engaged', 'فی الحال منگنی شدہ')}
            </span>
          </div>
          <span className="text-[10px] text-[#B88B22] font-medium mt-1 block">
            {tr('View completed marriages →', 'طے شدہ رشتے دیکھیں ←')}
          </span>
        </Link>

        {/* Tile 7: Revenue Collected */}
        <Link
          href="/invoices"
          className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E5DFD5] shadow-xs hover:border-[#D4AF37] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6466]">
              {tr('Revenue Collected', 'وصول شدہ رقم')}
            </span>
            <Receipt className="w-4 h-4 text-[#800F2F] group-hover:text-[#D4AF37]" />
          </div>
          <div className="mt-2">
            <span className="font-serif text-2xl font-bold text-[#800F2F] truncate block">
              {formatPKR(stats.totalRevenue)}
            </span>
          </div>
          <span className="text-[10px] text-[#B88B22] font-medium mt-1 block">
            {tr('View payment history →', 'ادائیگیوں کا ریکارڈ دیکھیں ←')}
          </span>
        </Link>

        {/* Tile 8: Outstanding Balance */}
        <Link
          href="/invoices"
          className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E5DFD5] shadow-xs hover:border-[#A3182E] transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A3182E]">
              {tr('Receivables Outstanding', 'واجب الادا بقایا جات')}
            </span>
            <Receipt className="w-4 h-4 text-[#A3182E]" />
          </div>
          <div className="mt-2">
            <span className="font-serif text-2xl font-bold text-[#A3182E] truncate block">
              {formatPKR(stats.outstandingBalance)}
            </span>
          </div>
          <span className="text-[10px] text-[#A3182E] font-medium mt-1 block">
            {tr('Unpaid client invoices →', 'بقایا انوائسز دیکھیں ←')}
          </span>
        </Link>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Stock by Age Bucket (Stacked Bar) */}
        <div className="lg:col-span-8 bg-[#FFFFFF] p-5 rounded-xl border border-[#E5DFD5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#800F2F]">
                {tr('Stock Breakdown by Age in Inventory', 'مدت کے لحاظ سے رشتہ اسٹاک کی تفصیل')}
              </h2>
              <p className="text-xs text-[#6E6466]">
                {tr('Distribution of available proposals across shelf-life buckets (Male in Maroon, Female in Gold).', 'دستیاب رشتوں کی مدت کے مطابق تقسیم (مرد میرون رنگ، خواتین گولڈ رنگ)۔')}
              </p>
            </div>
            <Link
              href="/reports"
              className="text-xs font-semibold text-[#800F2F] hover:underline flex items-center gap-1"
            >
              <span>{tr('Detailed Report', 'تفصیلی رپورٹ')}</span>
              <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
            </Link>
          </div>

          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.stockByAgeBucket} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fill: '#6E6466', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6E6466', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5DFD5', borderRadius: '8px', fontSize: '11px' }}
                    itemStyle={{ color: '#800F2F' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#800F2F' }} />
                  <Bar dataKey="male" name={tr('Male Stock', 'مردانہ رشتے')} stackId="a" fill="#800F2F" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="female" name={tr('Female Stock', 'خواتین رشتے')} stackId="a" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#6E6466]">
                {tr('Loading inventory visualization...', 'اسٹاک کا گراف لوڈ ہو رہا ہے...')}
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Inventory by Top Castes */}
        <div className="lg:col-span-4 bg-[#FFFFFF] p-5 rounded-xl border border-[#E5DFD5] shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#800F2F]">
              {tr('Top Castes in Circulation', 'موجودہ نمایاں ذاتیں / برادریاں')}
            </h2>
            <p className="text-xs text-[#6E6466]">
              {tr('Current stock volume grouped by family clan/caste.', 'برادری / ذات کے لحاظ سے رشتوں کی تعداد۔')}
            </p>
          </div>

          <div className="space-y-2.5">
            {stats.stockByCaste.map((item, idx) => {
              const pct = stats.totalStock > 0 ? Math.round((item.count / stats.totalStock) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#2C2526]">{item.caste}</span>
                    <span className="text-[#800F2F]">{item.count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F8F5F0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#800F2F] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#E5DFD5] flex items-center justify-between text-[11px] text-[#6E6466]">
            <span>{tr('Lahore Bureau Database', 'لاہور بیورو ڈیٹابیس')}</span>
            <Link href="/inventory" className="font-bold text-[#800F2F] hover:underline">
              {tr('Filter by caste →', 'ذات کے مطابق دیکھیں ←')}
            </Link>
          </div>
        </div>
      </div>

      {/* Two Operations Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Oldest Rishtas in Stock (Needs Attention) */}
        <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E5DFD5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#A3182E]" />
              <h2 className="font-serif text-base font-bold text-[#A3182E]">
                {tr('Oldest Rishtas Sitting Unmatched', 'پرانے رشتے جن پر ابھی میچنگ نہیں ہوئی')}
              </h2>
            </div>
            <Link
              href="/reports"
              className="text-xs font-semibold text-[#A3182E] hover:underline"
            >
              {tr('View all old stock →', 'تمام پرانا اسٹاک دیکھیں ←')}
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5DFD5] text-[10px] uppercase font-bold text-[#6E6466]">
                  <th className="py-2">{tr('Form No', 'فارم نمبر')}</th>
                  <th className="py-2">{tr('Candidate', 'امیدوار')}</th>
                  <th className="py-2">{tr('Days in Stock', 'اسٹاک کے دن')}</th>
                  <th className="py-2 text-center">{tr('Matches', 'میچز')}</th>
                  <th className="py-2 text-end">{tr('Action', 'عمل')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DFD5]/60">
                {oldStockList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#6E6466]">
                      {tr('No profiles currently exceed 90 days in stock. Stock velocity is optimal!', 'اس وقت 90 دن سے پرانا کوئی رشتہ موجود نہیں۔')}
                    </td>
                  </tr>
                ) : (
                  oldStockList.map(item => (
                    <tr key={item.profile.id} className="hover:bg-[#F8F5F0]">
                      <td className="py-2 font-serif font-bold text-[#800F2F]">{item.profile.formNo}</td>
                      <td className="py-2">
                        <span className="font-semibold text-[#2C2526] block">{item.profile.name}</span>
                        <span className="text-[10px] text-[#6E6466]">{item.profile.gender}, {item.profile.age}y • {item.profile.caste}</span>
                      </td>
                      <td className="py-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#A3182E] text-[#F8F5F0]">
                          {item.daysInStock} {tr('days', 'دن')}
                        </span>
                      </td>
                      <td className="py-2 text-center font-bold text-[#800F2F]">
                        {item.matchCount}
                      </td>
                      <td className="py-2 text-end">
                        <Link
                          href={`/profiles/${item.profile.id}/matches`}
                          className="px-2 py-1 rounded bg-[#800F2F] text-[#F8F5F0] text-[10px] font-semibold hover:bg-[#660A22]"
                        >
                          {tr('Find Match', 'میچ تلاش کریں')}
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Recently Added Stock */}
        <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E5DFD5] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-[#800F2F]" />
              <h2 className="font-serif text-base font-bold text-[#800F2F]">
                {tr('Recently Added Rishtas', 'حالیہ شامل کیے گئے رشتے')}
              </h2>
            </div>
            <Link
              href="/inventory"
              className="text-xs font-semibold text-[#800F2F] hover:underline"
            >
              {tr('View all stock →', 'مکمل اسٹاک دیکھیں ←')}
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5DFD5] text-[10px] uppercase font-bold text-[#6E6466]">
                  <th className="py-2">{tr('Form No', 'فارم نمبر')}</th>
                  <th className="py-2">{tr('Candidate', 'امیدوار')}</th>
                  <th className="py-2">{tr('City', 'شہر')}</th>
                  <th className="py-2">{tr('Status', 'حیثیت')}</th>
                  <th className="py-2 text-end">{tr('Action', 'عمل')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DFD5]/60">
                {recentStockList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#6E6466]">
                      {tr('No rishtas added yet. Click "Add Rishta" to begin.', 'ابھی کوئی رشتہ شامل نہیں کیا گیا۔ شروع کرنے کے لیے "نیا رشتہ درج کریں" پر کلک کریں۔')}
                    </td>
                  </tr>
                ) : recentStockList.map(p => (
                  <tr key={p.id} className="hover:bg-[#F8F5F0]">
                    <td className="py-2 font-serif font-bold text-[#800F2F]">
                      <div className="flex items-center gap-1">
                        <span>{p.formNo}</span>
                        {(p.isPremium || p.premiumMember) && (
                          <Star className="w-2.5 h-2.5 fill-[#D4AF37] text-[#D4AF37]" />
                        )}
                      </div>
                    </td>
                    <td className="py-2">
                      <span className="font-semibold text-[#2C2526] block">{p.name}</span>
                      <span className="text-[10px] text-[#6E6466]">{p.gender}, {p.age}y • {p.caste}</span>
                    </td>
                    <td className="py-2 text-[#6E6466]">{p.city}</td>
                    <td className="py-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#F8F5F0] text-[#800F2F] border border-[#E5DFD5] capitalize">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2 text-end">
                      <Link
                        href={`/profiles/${p.id}`}
                        className="px-2 py-1 rounded border border-[#800F2F] text-[#800F2F] text-[10px] font-semibold hover:bg-[#F8F5F0]"
                      >
                        {tr('Inspect', 'تفصیل')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#6E6466]">Loading Stock Operations Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
