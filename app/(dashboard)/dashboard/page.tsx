'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { store } from '@/lib/db/store';
import { Profile, Invoice, Proposal } from '@/lib/types';
import { formatPKR, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Users, 
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
  ShieldAlert,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const update = () => {
      setProfiles(store.getProfiles());
      setInvoices(store.getInvoices());
      setProposals(store.getProposals());
    };
    update();
    const unsub = store.subscribe(update);
    return unsub;
  }, []);

  // Compute metrics
  const activeProfiles = profiles.filter(p => p.status === 'active');
  const activeMale = activeProfiles.filter(p => p.gender === 'Male').length;
  const activeFemale = activeProfiles.filter(p => p.gender === 'Female').length;
  const pendingRequests = profiles.filter(p => p.status === 'pending_approval');
  const premiumMembers = profiles.filter(p => p.premiumMember && p.status === 'active');
  const premiumMatches = store.getAllPremiumMatches();
  const finalizedRishtas = proposals.filter(p => p.status === 'finalized');

  // Financial totals
  const totalIncome = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balance, 0);

  // Income by type (maroon & gold charts)
  const incomeByType = {
    registration: invoices
      .filter(i => i.invoiceType === 'registration')
      .reduce((s, i) => s + i.amountPaid, 0),
    premium: invoices
      .filter(i => i.invoiceType === 'premium')
      .reduce((s, i) => s + i.amountPaid, 0),
    success: invoices
      .filter(i => i.invoiceType === 'success')
      .reduce((s, i) => s + i.amountPaid, 0),
  };

  const copyRegLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/register`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDF8] p-6 rounded-2xl border border-[#E9DDC3] shadow-sm">
        <div>
          <span className="text-[11px] uppercase font-serif font-bold tracking-widest text-[#B08626]">
            Bureau Operations Control
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#5A0A14] mt-0.5">
            Welcome to Kiran Marriage Bureau Dashboard
          </h1>
          <p className="text-xs text-[#7B5E5E]">
            Verified matchmaking, real-time compatibility audit, and fee management for Lahore.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/profiles/new">
            <Button size="sm" variant="primary" icon={<Plus className="w-3.5 h-3.5 text-[#D9A93F]" />}>
              Add Rishta
            </Button>
          </Link>

          <Button
            size="sm"
            variant="secondary"
            onClick={copyRegLink}
            icon={copied ? <Check className="w-3.5 h-3.5 text-[#D9A93F]" /> : <Copy className="w-3.5 h-3.5 text-[#5A0A14]" />}
          >
            {copied ? 'Link Copied!' : 'Copy Form Link'}
          </Button>

          <Link href="/invoices">
            <Button size="sm" variant="accent" icon={<Receipt className="w-3.5 h-3.5 text-[#420610]" />}>
              Invoices
            </Button>
          </Link>
        </div>
      </div>

      {/* Pending Requests Alert Banner if any */}
      {pendingRequests.length > 0 && (
        <div className="p-4 rounded-xl bg-[#FFFDF8] border-2 border-[#D9A93F] flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D9A93F]/20 text-[#5A0A14] flex items-center justify-center shrink-0">
              <Inbox className="w-5 h-5 text-[#5A0A14]" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-[#5A0A14]">
                {pendingRequests.length} Online Registration Request(s) Awaiting Review
              </h3>
              <p className="text-xs text-[#7B5E5E]">
                New client submissions via public website. Review, verify, and approve to activate in matching engine.
              </p>
            </div>
          </div>

          <Link href="/requests">
            <Button size="sm" variant="primary" icon={<ArrowRight className="w-3.5 h-3.5 text-[#D9A93F]" />}>
              Review Inbox
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Rishtas */}
        <div className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC3] shadow-sm space-y-3">
          <div className="flex items-center justify-between text-[#7B5E5E]">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Rishtas</span>
            <Users className="w-4 h-4 text-[#5A0A14]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-3xl font-bold text-[#5A0A14]">
              {activeProfiles.length}
            </span>
            <span className="text-xs text-[#7B5E5E]">
              {activeMale} Male • {activeFemale} Female
            </span>
          </div>
          <div className="w-full bg-[#E9DDC3] h-1.5 rounded-full overflow-hidden flex">
            <div
              className="bg-[#5A0A14] h-full"
              style={{ width: `${activeProfiles.length > 0 ? (activeMale / activeProfiles.length) * 100 : 50}%` }}
              title={`Male: ${activeMale}`}
            />
            <div
              className="bg-[#D9A93F] h-full"
              style={{ width: `${activeProfiles.length > 0 ? (activeFemale / activeProfiles.length) * 100 : 50}%` }}
              title={`Female: ${activeFemale}`}
            />
          </div>
        </div>

        {/* Premium Matches */}
        <div className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#D9A93F] shadow-sm space-y-3">
          <div className="flex items-center justify-between text-[#B08626]">
            <span className="text-xs font-semibold uppercase tracking-wider">Premium Rishtay (75%+)</span>
            <Star className="w-4 h-4 fill-[#D9A93F] text-[#D9A93F]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-3xl font-bold text-[#B08626]">
              {premiumMatches.length}
            </span>
            <span className="text-xs text-[#7B5E5E]">
              {premiumMembers.length} VIP Clients
            </span>
          </div>
          <Link href="/premium" className="text-xs font-bold text-[#5A0A14] hover:text-[#B08626] flex items-center gap-1">
            <span>Browse 75%+ Matches</span>
            <ArrowRight className="w-3 h-3 text-[#D9A93F]" />
          </Link>
        </div>

        {/* Proposals in Progress */}
        <div className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC3] shadow-sm space-y-3">
          <div className="flex items-center justify-between text-[#7B5E5E]">
            <span className="text-xs font-semibold uppercase tracking-wider">Proposals & Sittings</span>
            <HeartHandshake className="w-4 h-4 text-[#5A0A14]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-3xl font-bold text-[#5A0A14]">
              {proposals.length}
            </span>
            <span className="text-xs text-[#7B5E5E]">
              {finalizedRishtas.length} Completed
            </span>
          </div>
          <Link href="/proposals" className="text-xs font-bold text-[#5A0A14] hover:text-[#B08626] flex items-center gap-1">
            <span>Open Proposals Pipeline</span>
            <ArrowRight className="w-3 h-3 text-[#D9A93F]" />
          </Link>
        </div>

        {/* Revenue This Month */}
        <div className="p-5 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC3] shadow-sm space-y-3">
          <div className="flex items-center justify-between text-[#7B5E5E]">
            <span className="text-xs font-semibold uppercase tracking-wider">Income Received</span>
            <Receipt className="w-4 h-4 text-[#5A0A14]" />
          </div>
          <div className="space-y-0.5">
            <span className="font-serif text-2xl font-bold text-[#5A0A14]">
              {formatPKR(totalIncome)}
            </span>
            <p className="text-[11px] text-[#8E1B2B]">
              Outstanding: {formatPKR(totalOutstanding)}
            </p>
          </div>
          <Link href="/invoices" className="text-xs font-bold text-[#5A0A14] hover:text-[#B08626] flex items-center gap-1">
            <span>View Fee Records</span>
            <ArrowRight className="w-3 h-3 text-[#D9A93F]" />
          </Link>
        </div>
      </div>

      {/* Two Column Layout: Charts & Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Financial Chart strictly in Maroon & Gold */}
        <div className="lg:col-span-7 bg-[#FFFDF8] border border-[#E9DDC3] rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-[#E9DDC3] pb-3">
            <h2 className="font-serif text-base font-bold text-[#5A0A14]">
              Revenue Breakdown by Matrimonial Service
            </h2>
            <span className="text-xs text-[#7B5E5E]">Strictly Maroon & Gold Palette</span>
          </div>

          <div className="space-y-4">
            {/* Registration Fee Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#2A0A0F]">Registration Fees</span>
                <span className="font-mono font-bold text-[#5A0A14]">{formatPKR(incomeByType.registration)}</span>
              </div>
              <div className="w-full bg-[#E9DDC3] h-3 rounded-full overflow-hidden">
                <div
                  className="bg-[#5A0A14] h-full rounded-full transition-all"
                  style={{ width: `${totalIncome > 0 ? (incomeByType.registration / totalIncome) * 100 : 40}%` }}
                />
              </div>
            </div>

            {/* Premium Membership Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#2A0A0F]">Premium Membership Fees</span>
                <span className="font-mono font-bold text-[#B08626]">{formatPKR(incomeByType.premium)}</span>
              </div>
              <div className="w-full bg-[#E9DDC3] h-3 rounded-full overflow-hidden">
                <div
                  className="bg-[#D9A93F] h-full rounded-full transition-all"
                  style={{ width: `${totalIncome > 0 ? (incomeByType.premium / totalIncome) * 100 : 50}%` }}
                />
              </div>
            </div>

            {/* Success Fee Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-[#2A0A0F]">Success Fees (Finalized Rishtas)</span>
                <span className="font-mono font-bold text-[#7A1424]">{formatPKR(incomeByType.success)}</span>
              </div>
              <div className="w-full bg-[#E9DDC3] h-3 rounded-full overflow-hidden">
                <div
                  className="bg-[#7A1424] h-full rounded-full transition-all"
                  style={{ width: `${totalIncome > 0 ? (incomeByType.success / totalIncome) * 100 : 30}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Summary Card */}
          <div className="p-4 bg-[#FBF4E6] rounded-xl border border-[#E9DDC3] grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] text-[#7B5E5E] uppercase block">Total Invoices</span>
              <span className="font-bold text-[#5A0A14]">{invoices.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#7B5E5E] uppercase block">Fully Settled</span>
              <span className="font-bold text-[#5A0A14]">{invoices.filter(i => i.status === 'paid').length}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#7B5E5E] uppercase block">Partially Paid</span>
              <span className="font-bold text-[#B08626]">{invoices.filter(i => i.status === 'partial').length}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Follow-ups & Reminders */}
        <div className="lg:col-span-5 bg-[#FFFDF8] border border-[#E9DDC3] rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E9DDC3] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D9A93F]" />
                <h2 className="font-serif text-base font-bold text-[#5A0A14]">
                  Upcoming Family Follow-Ups
                </h2>
              </div>
              <Link href="/proposals" className="text-xs text-[#5A0A14] hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {proposals.slice(0, 4).map(prop => (
                <div
                  key={prop.id}
                  className="p-3 bg-[#FBF4E6] rounded-xl border border-[#E9DDC3] space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#5A0A14] truncate max-w-[200px]">
                      {prop.profileAName} & {prop.profileBName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFFDF8] border border-[#D9A93F] text-[#5A0A14] capitalize">
                      {prop.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#7B5E5E] truncate">
                    {prop.notes || 'Awaiting parental decision.'}
                  </p>

                  <div className="text-[10px] text-[#7B5E5E] flex items-center justify-between pt-1 border-t border-[#E9DDC3]/60">
                    <span>Follow-up: {prop.followUpDate ? formatDate(prop.followUpDate) : 'Not set'}</span>
                    <span>Handler: {prop.sentBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link href="/proposals" className="block pt-2">
            <Button size="sm" variant="secondary" className="w-full">
              Open Full Proposal Pipeline
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
