'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { store } from '@/lib/db/store';
import { Profile, Invoice, Proposal, StockStatus, AgeBucket } from '@/lib/types';
import { formatPKR, formatDate, calculateDaysInStock, getAgeBucket, getAgeBucketLabel } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  BarChart3, 
  Printer, 
  Download, 
  Calendar, 
  Filter, 
  Boxes, 
  HeartHandshake, 
  Receipt, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  FileText
} from 'lucide-react';

function ReportsContent() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeTab, setActiveTab] = useState<'stock' | 'new_entries' | 'old_stock' | 'closed' | 'proposals' | 'financial'>('stock');

  // Date Range filter
  const [dateRangePreset, setDateRangePreset] = useState<'all' | '7days' | '30days' | '90days' | 'this_month'>('30days');

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

  // Compute cutoff date from preset
  const cutoffDate = useMemo(() => {
    const now = Date.now();
    switch (dateRangePreset) {
      case '7days': return new Date(now - 7 * 86400000).toISOString();
      case '30days': return new Date(now - 30 * 86400000).toISOString();
      case '90days': return new Date(now - 90 * 86400000).toISOString();
      case 'this_month': {
        const d = new Date();
        d.setDate(1);
        d.setHours(0,0,0,0);
        return d.toISOString();
      }
      default: return '1970-01-01T00:00:00.000Z';
    }
  }, [dateRangePreset]);

  // Tab 1: Stock data
  const availableStock = useMemo(() => {
    return profiles.filter(p => p.status === 'available' || (p.status as any) === 'active');
  }, [profiles]);

  // Tab 2: New entries in range
  const newEntries = useMemo(() => {
    return profiles.filter(p => {
      const entryTime = new Date(p.entryDate || p.createdAt).toISOString();
      return entryTime >= cutoffDate;
    });
  }, [profiles, cutoffDate]);

  // Tab 3: Old stock (91+ days sitting available)
  const oldStock = useMemo(() => {
    return store.getOldStockProfiles(91);
  }, [profiles]);

  // Tab 4: Closed / Finalized
  const finalizedList = useMemo(() => {
    return proposals.filter(pr => pr.status === 'finalized');
  }, [proposals]);

  // Tab 5: Proposals in range
  const rangeProposals = useMemo(() => {
    return proposals.filter(pr => pr.createdAt >= cutoffDate);
  }, [proposals, cutoffDate]);

  // Tab 6: Invoices in range
  const rangeInvoices = useMemo(() => {
    return invoices.filter(inv => inv.createdAt >= cutoffDate);
  }, [invoices, cutoffDate]);

  const totalRevenue = rangeInvoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
  const totalOutstanding = rangeInvoices
    .filter(i => i.status !== 'cancelled' && i.status !== 'paid')
    .reduce((s, i) => s + (i.balance || 0), 0);

  // CSV Export for active tab
  const exportActiveCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `kiran_report_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;

    if (activeTab === 'stock' || activeTab === 'new_entries') {
      const list = activeTab === 'stock' ? availableStock : newEntries;
      headers = ['Form No', 'Entry Date', 'Days In Stock', 'Name', 'Gender', 'Age', 'Caste', 'Maslak', 'City', 'Profession', 'Income', 'Status'];
      rows = list.map(p => [
        `"${p.formNo}"`,
        `"${p.entryDate || p.createdAt.split('T')[0]}"`,
        String(calculateDaysInStock(p.entryDate || p.createdAt)),
        `"${p.name}"`,
        p.gender,
        String(p.age),
        `"${p.caste}"`,
        `"${p.maslak}"`,
        `"${p.city}"`,
        `"${p.profession}"`,
        String(p.monthlyIncome || 0),
        p.status
      ]);
    } else if (activeTab === 'old_stock') {
      headers = ['Form No', 'Name', 'Gender', 'Age', 'Entry Date', 'Days in Stock', 'Caste', 'City', 'Available Matches', 'Phone'];
      rows = oldStock.map(item => [
        `"${item.profile.formNo}"`,
        `"${item.profile.name}"`,
        item.profile.gender,
        String(item.profile.age),
        `"${item.profile.entryDate || item.profile.createdAt.split('T')[0]}"`,
        String(item.daysInStock),
        `"${item.profile.caste}"`,
        `"${item.profile.city}"`,
        String(item.matchCount),
        `"${item.profile.phone}"`
      ]);
    } else if (activeTab === 'closed') {
      headers = ['Proposal ID', 'Candidate A', 'Candidate B', 'Match Score', 'Finalized Date', 'Notes'];
      rows = finalizedList.map(pr => [
        `"${pr.id}"`,
        `"${pr.profileAName}"`,
        `"${pr.profileBName}"`,
        `${pr.matchScore}%`,
        `"${formatDate(pr.updatedAt)}"`,
        `"${pr.notes || ''}"`
      ]);
    } else if (activeTab === 'proposals') {
      headers = ['Proposal ID', 'Candidate A', 'Candidate B', 'Score', 'Status', 'Date Sent'];
      rows = rangeProposals.map(pr => [
        `"${pr.id}"`,
        `"${pr.profileAName}"`,
        `"${pr.profileBName}"`,
        `${pr.matchScore}%`,
        pr.status,
        `"${formatDate(pr.createdAt)}"`
      ]);
    } else if (activeTab === 'financial') {
      headers = ['Invoice No', 'Client Name', 'Type', 'Date', 'Subtotal', 'Paid', 'Balance', 'Status'];
      rows = rangeInvoices.map(inv => [
        `"${inv.invoiceNumber}"`,
        `"${inv.clientName}"`,
        inv.invoiceType,
        inv.date,
        String(inv.total),
        String(inv.amountPaid),
        String(inv.balance),
        inv.status
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDF8] p-5 rounded-xl border border-[#E9DDC3] shadow-sm no-print">
        <div>
          <span className="text-[10px] uppercase font-serif font-bold tracking-widest text-[#B08626]">
            Inventory Intelligence & Auditing
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#5A0A14] mt-0.5">
            Reports & Analytics
          </h1>
          <p className="text-xs text-[#7B5E5E]">
            Comprehensive operational reports for stock turnover, aging rishtas, success fees, and financials.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Date range filter */}
          <div className="flex items-center gap-1.5 text-xs bg-[#FBF4E6] px-3 py-1.5 rounded-lg border border-[#E9DDC3]">
            <Calendar className="w-3.5 h-3.5 text-[#5A0A14]" />
            <select
              value={dateRangePreset}
              onChange={(e) => setDateRangePreset(e.target.value as any)}
              className="bg-transparent font-semibold text-[#5A0A14] focus:outline-none"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="this_month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={exportActiveCSV}
            icon={<Download className="w-3.5 h-3.5 text-[#5A0A14]" />}
          >
            Export CSV
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handlePrint}
            icon={<Printer className="w-3.5 h-3.5 text-[#D9A93F]" />}
          >
            Print Report
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-[#E9DDC3] no-print">
        {[
          { key: 'stock', label: '1. Stock Inventory', icon: Boxes, count: availableStock.length },
          { key: 'new_entries', label: '2. New Entries', icon: Clock, count: newEntries.length },
          { key: 'old_stock', label: '3. Old Stock Alert (91+d)', icon: AlertCircle, count: oldStock.length },
          { key: 'closed', label: '4. Closed / Rishta Done', icon: CheckCircle, count: finalizedList.length },
          { key: 'proposals', label: '5. Proposals Sent', icon: HeartHandshake, count: rangeProposals.length },
          { key: 'financial', label: '6. Revenue & Receivables', icon: Receipt, count: rangeInvoices.length },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-t-lg font-semibold whitespace-nowrap transition-colors border-t border-x ${
                isActive
                  ? 'bg-[#5A0A14] text-[#FBF4E6] border-[#5A0A14] shadow-xs'
                  : 'bg-[#FFFDF8] text-[#5A0A14] border-[#E9DDC3] hover:bg-[#FBF4E6]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D9A93F]' : 'text-[#7B5E5E]'}`} />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive ? 'bg-[#D9A93F] text-[#420610] font-bold' : 'bg-[#E9DDC3] text-[#7B5E5E]'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Printable Report Header (Visible only in print or top of view) */}
      <div className="hidden print:block text-center border-b border-[#5A0A14] pb-4 mb-4">
        <h1 className="font-serif text-2xl font-bold text-[#5A0A14]">Kiran Marriage Bureau, Lahore</h1>
        <p className="text-xs text-[#7B5E5E]">Official Operational Stock & Performance Audit Report</p>
        <p className="text-[10px] text-[#7B5E5E] mt-1">Generated: {new Date().toLocaleString('en-PK')} • Scope: {dateRangePreset.toUpperCase()}</p>
      </div>

      {/* Tab 1: Current Stock Report */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#FFFDF8] rounded-xl border border-[#E9DDC3]">
              <span className="text-[10px] text-[#7B5E5E] uppercase block font-semibold">Available Stock</span>
              <span className="font-serif text-2xl font-bold text-[#5A0A14]">{availableStock.length}</span>
            </div>
            <div className="p-3 bg-[#FFFDF8] rounded-xl border border-[#E9DDC3]">
              <span className="text-[10px] text-[#7B5E5E] uppercase block font-semibold">Male Stock</span>
              <span className="font-serif text-2xl font-bold text-[#5A0A14]">{availableStock.filter(p => p.gender === 'Male').length}</span>
            </div>
            <div className="p-3 bg-[#FFFDF8] rounded-xl border border-[#E9DDC3]">
              <span className="text-[10px] text-[#7B5E5E] uppercase block font-semibold">Female Stock</span>
              <span className="font-serif text-2xl font-bold text-[#5A0A14]">{availableStock.filter(p => p.gender === 'Female').length}</span>
            </div>
            <div className="p-3 bg-[#FFFDF8] rounded-xl border border-[#E9DDC3]">
              <span className="text-[10px] text-[#7B5E5E] uppercase block font-semibold">Premium Members</span>
              <span className="font-serif text-2xl font-bold text-[#D9A93F]">{availableStock.filter(p => p.isPremium || p.premiumMember).length}</span>
            </div>
          </div>

          <div className="bg-[#FFFDF8] border border-[#E9DDC3] rounded-xl overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#5A0A14] text-[#FBF4E6] text-[11px] uppercase font-semibold">
                  <th className="p-2.5">Form No</th>
                  <th className="p-2.5">Candidate Name</th>
                  <th className="p-2.5">Gender</th>
                  <th className="p-2.5">Age</th>
                  <th className="p-2.5">Caste</th>
                  <th className="p-2.5">Maslak</th>
                  <th className="p-2.5">City</th>
                  <th className="p-2.5">Profession</th>
                  <th className="p-2.5">Stock Age</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DDC3]">
                {availableStock.map((p, idx) => {
                  const days = calculateDaysInStock(p.entryDate || p.createdAt);
                  const b = getAgeBucketLabel(getAgeBucket(days));
                  return (
                    <tr key={p.id} className={idx % 2 === 0 ? 'bg-[#FFFDF8]' : 'bg-[#FAF6EC]'}>
                      <td className="p-2.5 font-bold font-serif text-[#5A0A14]">{p.formNo}</td>
                      <td className="p-2.5 font-semibold text-[#2A0A0F]">{p.name}</td>
                      <td className="p-2.5">{p.gender}</td>
                      <td className="p-2.5">{p.age}</td>
                      <td className="p-2.5">{p.caste}</td>
                      <td className="p-2.5">{p.maslak}</td>
                      <td className="p-2.5">{p.city}</td>
                      <td className="p-2.5">{p.profession}</td>
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${b.badgeClass}`}>
                          {days}d ({b.label})
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: New Entries Report */}
      {activeTab === 'new_entries' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#FFFDF8] rounded-xl border border-[#E9DDC3]">
            <span className="text-xs font-bold text-[#5A0A14]">
              {newEntries.length} rishtas entered into inventory in the selected timeframe ({dateRangePreset}).
            </span>
          </div>

          <div className="bg-[#FFFDF8] border border-[#E9DDC3] rounded-xl overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#5A0A14] text-[#FBF4E6] text-[11px] uppercase font-semibold">
                  <th className="p-2.5">Form No</th>
                  <th className="p-2.5">Entry Date</th>
                  <th className="p-2.5">Candidate Name</th>
                  <th className="p-2.5">Gender / Age</th>
                  <th className="p-2.5">Caste</th>
                  <th className="p-2.5">City</th>
                  <th className="p-2.5">Applied By</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DDC3]">
                {newEntries.map((p, idx) => (
                  <tr key={p.id} className={idx % 2 === 0 ? 'bg-[#FFFDF8]' : 'bg-[#FAF6EC]'}>
                    <td className="p-2.5 font-bold font-serif text-[#5A0A14]">{p.formNo}</td>
                    <td className="p-2.5">{formatDate(p.entryDate || p.createdAt)}</td>
                    <td className="p-2.5 font-semibold text-[#2A0A0F]">{p.name}</td>
                    <td className="p-2.5">{p.gender}, {p.age}y</td>
                    <td className="p-2.5">{p.caste}</td>
                    <td className="p-2.5">{p.city}</td>
                    <td className="p-2.5 text-[#7B5E5E]">{p.appliedBy || 'Bureau Staff'}</td>
                    <td className="p-2.5">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Old Stock Report */}
      {activeTab === 'old_stock' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#8E1B2B]/10 border border-[#8E1B2B]/30 rounded-xl flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#8E1B2B]">
                Old Stock Alert: {oldStock.length} Profiles sitting unmatched for 91+ Days
              </h2>
              <p className="text-xs text-[#7B5E5E]">
                These candidates require proactive follow-up, preference widening, or active proposal dispatch.
              </p>
            </div>
            <span className="font-serif text-3xl font-bold text-[#8E1B2B]">{oldStock.length}</span>
          </div>

          <div className="bg-[#FFFDF8] border border-[#E9DDC3] rounded-xl overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#5A0A14] text-[#FBF4E6] text-[11px] uppercase font-semibold">
                  <th className="p-2.5">Form No</th>
                  <th className="p-2.5">Candidate</th>
                  <th className="p-2.5">Gender / Age</th>
                  <th className="p-2.5">Days in Stock</th>
                  <th className="p-2.5">Caste</th>
                  <th className="p-2.5">City</th>
                  <th className="p-2.5 text-center">Available Matches</th>
                  <th className="p-2.5">Candidate Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DDC3]">
                {oldStock.map((item, idx) => (
                  <tr key={item.profile.id} className={idx % 2 === 0 ? 'bg-[#FFFDF8]' : 'bg-[#FAF6EC]'}>
                    <td className="p-2.5 font-bold font-serif text-[#5A0A14]">{item.profile.formNo}</td>
                    <td className="p-2.5 font-semibold text-[#2A0A0F]">{item.profile.name}</td>
                    <td className="p-2.5">{item.profile.gender}, {item.profile.age}y</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#8E1B2B] text-[#FBF4E6]">
                        {item.daysInStock} days
                      </span>
                    </td>
                    <td className="p-2.5">{item.profile.caste}</td>
                    <td className="p-2.5">{item.profile.city}</td>
                    <td className="p-2.5 text-center font-bold text-[#5A0A14]">{item.matchCount}</td>
                    <td className="p-2.5 font-medium">{item.profile.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Closed / Rishta Done */}
      {activeTab === 'closed' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#FFFDF8] rounded-xl border border-[#D9A93F] flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#5A0A14]">
                Total Successful Matrimonies: {finalizedList.length} Finalized Rishtay
              </h2>
              <p className="text-xs text-[#7B5E5E]">
                Proposals marked completed ("Rishta Done"), candidate profiles transitioned to engaged/married.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#7B5E5E] block uppercase">Success Rate</span>
              <span className="font-serif text-2xl font-bold text-[#D9A93F]">100%</span>
            </div>
          </div>

          <div className="bg-[#FFFDF8] border border-[#E9DDC3] rounded-xl overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#5A0A14] text-[#FBF4E6] text-[11px] uppercase font-semibold">
                  <th className="p-2.5">Proposal ID</th>
                  <th className="p-2.5">Groom Candidate</th>
                  <th className="p-2.5">Bride Candidate</th>
                  <th className="p-2.5">Compatibility Score</th>
                  <th className="p-2.5">Finalized Date</th>
                  <th className="p-2.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DDC3]">
                {finalizedList.map((pr, idx) => (
                  <tr key={pr.id} className={idx % 2 === 0 ? 'bg-[#FFFDF8]' : 'bg-[#FAF6EC]'}>
                    <td className="p-2.5 font-bold font-serif text-[#5A0A14]">{pr.id}</td>
                    <td className="p-2.5 font-semibold text-[#2A0A0F]">{pr.profileAName}</td>
                    <td className="p-2.5 font-semibold text-[#2A0A0F]">{pr.profileBName}</td>
                    <td className="p-2.5 font-bold text-[#D9A93F]">{pr.matchScore}%</td>
                    <td className="p-2.5">{formatDate(pr.updatedAt)}</td>
                    <td className="p-2.5 text-[#7B5E5E] truncate max-w-xs">{pr.notes || 'Rishta finalized.'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Proposals Sent */}
      {activeTab === 'proposals' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#FFFDF8] rounded-xl border border-[#E9DDC3]">
            <span className="text-xs font-bold text-[#5A0A14]">
              {rangeProposals.length} formal proposals created or updated in selected timeframe.
            </span>
          </div>

          <div className="bg-[#FFFDF8] border border-[#E9DDC3] rounded-xl overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#5A0A14] text-[#FBF4E6] text-[11px] uppercase font-semibold">
                  <th className="p-2.5">Proposal ID</th>
                  <th className="p-2.5">Candidate A</th>
                  <th className="p-2.5">Candidate B</th>
                  <th className="p-2.5">Match Score</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Date Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DDC3]">
                {rangeProposals.map((pr, idx) => (
                  <tr key={pr.id} className={idx % 2 === 0 ? 'bg-[#FFFDF8]' : 'bg-[#FAF6EC]'}>
                    <td className="p-2.5 font-bold font-serif text-[#5A0A14]">{pr.id}</td>
                    <td className="p-2.5 font-semibold text-[#2A0A0F]">{pr.profileAName}</td>
                    <td className="p-2.5 font-semibold text-[#2A0A0F]">{pr.profileBName}</td>
                    <td className="p-2.5 font-bold text-[#5A0A14]">{pr.matchScore}%</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FBF4E6] border border-[#E9DDC3] capitalize">
                        {pr.status}
                      </span>
                    </td>
                    <td className="p-2.5">{formatDate(pr.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Financial Report */}
      {activeTab === 'financial' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FFFDF8] rounded-xl border border-[#E9DDC3]">
              <span className="text-[10px] text-[#7B5E5E] uppercase block font-semibold">Revenue Collected</span>
              <span className="font-serif text-3xl font-bold text-[#5A0A14]">{formatPKR(totalRevenue)}</span>
            </div>
            <div className="p-4 bg-[#FFFDF8] rounded-xl border border-[#E9DDC3]">
              <span className="text-[10px] text-[#7B5E5E] uppercase block font-semibold">Outstanding Receivables</span>
              <span className="font-serif text-3xl font-bold text-[#8E1B2B]">{formatPKR(totalOutstanding)}</span>
            </div>
          </div>

          <div className="bg-[#FFFDF8] border border-[#E9DDC3] rounded-xl overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#5A0A14] text-[#FBF4E6] text-[11px] uppercase font-semibold">
                  <th className="p-2.5">Invoice No</th>
                  <th className="p-2.5">Client Name</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Total Amount</th>
                  <th className="p-2.5">Amount Paid</th>
                  <th className="p-2.5">Balance</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DDC3]">
                {rangeInvoices.map((inv, idx) => (
                  <tr key={inv.id} className={idx % 2 === 0 ? 'bg-[#FFFDF8]' : 'bg-[#FAF6EC]'}>
                    <td className="p-2.5 font-bold font-serif text-[#5A0A14]">{inv.invoiceNumber}</td>
                    <td className="p-2.5 font-semibold text-[#2A0A0F]">{inv.clientName}</td>
                    <td className="p-2.5 capitalize">{inv.invoiceType}</td>
                    <td className="p-2.5">{inv.date}</td>
                    <td className="p-2.5 font-semibold">{formatPKR(inv.total)}</td>
                    <td className="p-2.5 text-[#5A0A14] font-semibold">{formatPKR(inv.amountPaid)}</td>
                    <td className="p-2.5 font-bold text-[#8E1B2B]">{formatPKR(inv.balance)}</td>
                    <td className="p-2.5 capitalize font-semibold">{inv.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#7B5E5E]">Loading Bureau Reports...</div>}>
      <ReportsContent />
    </Suspense>
  );
}

