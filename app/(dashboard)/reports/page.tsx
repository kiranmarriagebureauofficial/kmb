'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { store } from '@/lib/db/store';
import { Profile, Invoice, Proposal, StockStatus, AgeBucket } from '@/lib/types';
import { formatPKR, formatDate, calculateDaysInStock, getAgeBucket, getAgeBucketLabel } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { exportRishtayPDF, filterProfilesByDateRange, getProfileDateKey } from '@/lib/pdf-export';
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
  const [dateRangePreset, setDateRangePreset] = useState<'all' | '7days' | '30days' | '90days' | 'this_month' | 'custom'>('all');
  const [customFromDate, setCustomFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [customToDate, setCustomToDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

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

  // Resolve effective fromDate / toDate YYYY-MM-DD strings
  const { effectiveFromDate, effectiveToDate } = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    if (dateRangePreset === 'custom') {
      return { effectiveFromDate: customFromDate || undefined, effectiveToDate: customToDate || undefined };
    }
    const now = Date.now();
    switch (dateRangePreset) {
      case '7days':
        return { effectiveFromDate: new Date(now - 7 * 86400000).toISOString().split('T')[0], effectiveToDate: today };
      case '30days':
        return { effectiveFromDate: new Date(now - 30 * 86400000).toISOString().split('T')[0], effectiveToDate: today };
      case '90days':
        return { effectiveFromDate: new Date(now - 90 * 86400000).toISOString().split('T')[0], effectiveToDate: today };
      case 'this_month': {
        const d = new Date();
        d.setDate(1);
        return { effectiveFromDate: d.toISOString().split('T')[0], effectiveToDate: today };
      }
      default:
        return { effectiveFromDate: undefined, effectiveToDate: undefined };
    }
  }, [dateRangePreset, customFromDate, customToDate]);

  // Tab 1: Stock data
  const availableStock = useMemo(() => {
    return profiles.filter(p => p.status === 'available' || (p.status as any) === 'active');
  }, [profiles]);

  const maleAvailableStock = useMemo(() => availableStock.filter(p => p.gender === 'Male'), [availableStock]);
  const femaleAvailableStock = useMemo(() => availableStock.filter(p => p.gender === 'Female'), [availableStock]);

  // Tab 2: New entries in range
  const newEntries = useMemo(() => {
    return filterProfilesByDateRange(profiles, effectiveFromDate, effectiveToDate);
  }, [profiles, effectiveFromDate, effectiveToDate]);

  const maleNewEntries = useMemo(() => newEntries.filter(p => p.gender === 'Male'), [newEntries]);
  const femaleNewEntries = useMemo(() => newEntries.filter(p => p.gender === 'Female'), [newEntries]);

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
    return proposals.filter(pr => {
      const k = pr.createdAt.slice(0, 10);
      if (effectiveFromDate && k < effectiveFromDate) return false;
      if (effectiveToDate && k > effectiveToDate) return false;
      return true;
    });
  }, [proposals, effectiveFromDate, effectiveToDate]);

  // Tab 6: Invoices in range
  const rangeInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const k = (inv.date || inv.createdAt).slice(0, 10);
      if (effectiveFromDate && k < effectiveFromDate) return false;
      if (effectiveToDate && k > effectiveToDate) return false;
      return true;
    });
  }, [invoices, effectiveFromDate, effectiveToDate]);

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

  const handleDownloadPDF = async () => {
    setIsExportingPdf(true);
    try {
      const sourceProfiles = activeTab === 'stock' ? availableStock : profiles;
      await exportRishtayPDF(sourceProfiles, {
        fromDate: activeTab === 'stock' ? undefined : effectiveFromDate,
        toDate: activeTab === 'stock' ? undefined : effectiveToDate,
        title:
          activeTab === 'stock'
            ? 'Available Rishta Stock (Male & Female)'
            : 'Rishtay Report (Date Range)',
        bureauSettings: store.getSettings(),
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-5 rounded-xl border border-[#E5DFD5] shadow-sm no-print">
        <div>
          <span className="text-[10px] uppercase font-serif font-bold tracking-widest text-[#B88B22]">
            Inventory Intelligence & Auditing
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#800F2F] mt-0.5">
            Reports & Analytics
          </h1>
          <p className="text-xs text-[#6E6466]">
            Comprehensive operational reports for stock turnover, aging rishtas, success fees, and financials.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Date range filter */}
          <div className="flex items-center gap-1.5 text-xs bg-[#F8F5F0] px-3 py-1.5 rounded-lg border border-[#E5DFD5]">
            <Calendar className="w-3.5 h-3.5 text-[#800F2F]" />
            <select
              value={dateRangePreset}
              onChange={(e) => setDateRangePreset(e.target.value as any)}
              className="bg-transparent font-semibold text-[#800F2F] focus:outline-none"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="this_month">This Month</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {dateRangePreset === 'custom' && (
            <div className="flex items-center gap-1.5 text-xs bg-[#F8F5F0] px-2.5 py-1 rounded-lg border border-[#D4AF37]">
              <span className="text-[10px] font-bold text-[#800F2F]">From:</span>
              <input
                type="date"
                value={customFromDate}
                onChange={(e) => setCustomFromDate(e.target.value)}
                className="bg-[#FFFFFF] border border-[#E5DFD5] rounded px-1.5 py-0.5 text-[11px] text-[#2C2526]"
              />
              <span className="text-[10px] font-bold text-[#800F2F]">To:</span>
              <input
                type="date"
                value={customToDate}
                onChange={(e) => setCustomToDate(e.target.value)}
                className="bg-[#FFFFFF] border border-[#E5DFD5] rounded px-1.5 py-0.5 text-[11px] text-[#2C2526]"
              />
            </div>
          )}

          <Button
            size="sm"
            variant="accent"
            disabled={isExportingPdf}
            onClick={handleDownloadPDF}
            icon={<FileText className="w-3.5 h-3.5 text-[#800F2F]" />}
          >
            {isExportingPdf ? 'Generating PDF...' : 'Download PDF (Male/Female)'}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={exportActiveCSV}
            icon={<Download className="w-3.5 h-3.5 text-[#800F2F]" />}
          >
            Export CSV
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handlePrint}
            icon={<Printer className="w-3.5 h-3.5 text-[#D4AF37]" />}
          >
            Print Report
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-[#E5DFD5] no-print">
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
                  ? 'bg-[#800F2F] text-[#F8F5F0] border-[#800F2F] shadow-xs'
                  : 'bg-[#FFFFFF] text-[#800F2F] border-[#E5DFD5] hover:bg-[#F8F5F0]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D4AF37]' : 'text-[#6E6466]'}`} />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive ? 'bg-[#D4AF37] text-[#660A22] font-bold' : 'bg-[#E5DFD5] text-[#6E6466]'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Printable Report Header (Visible only in print or top of view) */}
      <div className="hidden print:block text-center border-b border-[#800F2F] pb-4 mb-4">
        <h1 className="font-serif text-2xl font-bold text-[#800F2F]">Kiran Marriage Bureau, Lahore</h1>
        <p className="text-xs text-[#6E6466]">Official Operational Stock & Performance Audit Report</p>
        <p className="text-[10px] text-[#6E6466] mt-1">Generated: {new Date().toLocaleString('en-PK')} • Scope: {dateRangePreset.toUpperCase()}</p>
      </div>

      {/* Tab 1: Current Stock Report */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5DFD5]">
              <span className="text-[10px] text-[#6E6466] uppercase block font-semibold">Available Stock</span>
              <span className="font-serif text-2xl font-bold text-[#800F2F]">{availableStock.length}</span>
            </div>
            <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5DFD5]">
              <span className="text-[10px] text-[#6E6466] uppercase block font-semibold">Male Stock</span>
              <span className="font-serif text-2xl font-bold text-[#800F2F]">{availableStock.filter(p => p.gender === 'Male').length}</span>
            </div>
            <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5DFD5]">
              <span className="text-[10px] text-[#6E6466] uppercase block font-semibold">Female Stock</span>
              <span className="font-serif text-2xl font-bold text-[#800F2F]">{availableStock.filter(p => p.gender === 'Female').length}</span>
            </div>
            <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5DFD5]">
              <span className="text-[10px] text-[#6E6466] uppercase block font-semibold">Premium Members</span>
              <span className="font-serif text-2xl font-bold text-[#D4AF37]">{availableStock.filter(p => p.isPremium || p.premiumMember).length}</span>
            </div>
          </div>

          {[
            { title: 'Section A: Male Rishtay (Grooms)', list: maleAvailableStock, emptyMsg: 'No male rishtay currently available in stock.' },
            { title: 'Section B: Female Rishtay (Brides)', list: femaleAvailableStock, emptyMsg: 'No female rishtay currently available in stock.' },
          ].map((sec) => (
            <div key={sec.title} className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-xl overflow-x-auto shadow-xs">
              <div className="bg-[#660A22] text-[#D4AF37] px-4 py-2.5 flex items-center justify-between border-b border-[#D4AF37]">
                <h3 className="font-serif font-bold text-sm">{sec.title}</h3>
                <span className="text-[11px] bg-[#D4AF37] text-[#660A22] px-2 py-0.5 rounded-full font-bold">
                  {sec.list.length} Profiles
                </span>
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#800F2F] text-[#F8F5F0] text-[11px] uppercase font-semibold">
                    <th className="p-2.5">Register / Form No</th>
                    <th className="p-2.5">Candidate Name</th>
                    <th className="p-2.5">Age</th>
                    <th className="p-2.5">Caste</th>
                    <th className="p-2.5">Maslak</th>
                    <th className="p-2.5">City</th>
                    <th className="p-2.5">Profession</th>
                    <th className="p-2.5">Stock Age</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD5]">
                  {sec.list.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-xs text-[#6E6466]">{sec.emptyMsg}</td>
                    </tr>
                  ) : (
                    sec.list.map((p, idx) => {
                      const days = calculateDaysInStock(p.entryDate || p.createdAt);
                      const b = getAgeBucketLabel(getAgeBucket(days));
                      return (
                        <tr key={p.id} className={idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#FAF7F2]'}>
                          <td className="p-2.5 font-bold font-serif text-[#800F2F]">{p.formNo}</td>
                          <td className="p-2.5 font-semibold text-[#2C2526]">
                            <div className="flex items-center gap-2">
                              <ProfileAvatar name={p.name} photoUrl={p.photoUrl} size="xs" isPremium={Boolean(p.isPremium || p.premiumMember)} />
                              <span>{p.name}</span>
                            </div>
                          </td>
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
                    })
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: New Entries Report */}
      {activeTab === 'new_entries' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E5DFD5] flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#800F2F]">
              {newEntries.length} rishtas entered ({maleNewEntries.length} Male, {femaleNewEntries.length} Female)
              {effectiveFromDate || effectiveToDate ? ` from ${effectiveFromDate || 'start'} to ${effectiveToDate || 'today'}` : ' across all dates'}.
            </span>
          </div>

          {[
            { title: 'Section A: Male Rishtay (New Entries)', list: maleNewEntries, emptyMsg: 'No male rishtay entered in this date range.' },
            { title: 'Section B: Female Rishtay (New Entries)', list: femaleNewEntries, emptyMsg: 'No female rishtay entered in this date range.' },
          ].map((sec) => (
            <div key={sec.title} className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-xl overflow-x-auto shadow-xs">
              <div className="bg-[#660A22] text-[#D4AF37] px-4 py-2.5 flex items-center justify-between border-b border-[#D4AF37]">
                <h3 className="font-serif font-bold text-sm">{sec.title}</h3>
                <span className="text-[11px] bg-[#D4AF37] text-[#660A22] px-2 py-0.5 rounded-full font-bold">
                  {sec.list.length} Profiles
                </span>
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#800F2F] text-[#F8F5F0] text-[11px] uppercase font-semibold">
                    <th className="p-2.5">Register / Form No</th>
                    <th className="p-2.5">Entry Date</th>
                    <th className="p-2.5">Candidate Name</th>
                    <th className="p-2.5">Age / Height</th>
                    <th className="p-2.5">Caste</th>
                    <th className="p-2.5">City</th>
                    <th className="p-2.5">Phone</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD5]">
                  {sec.list.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-xs text-[#6E6466]">{sec.emptyMsg}</td>
                    </tr>
                  ) : (
                    sec.list.map((p, idx) => (
                      <tr key={p.id} className={idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#FAF7F2]'}>
                        <td className="p-2.5 font-bold font-serif text-[#800F2F]">{p.formNo}</td>
                        <td className="p-2.5">{getProfileDateKey(p)}</td>
                        <td className="p-2.5 font-semibold text-[#2C2526]">
                          <div className="flex items-center gap-2">
                            <ProfileAvatar name={p.name} photoUrl={p.photoUrl} size="xs" isPremium={Boolean(p.isPremium || p.premiumMember)} />
                            <span>{p.name}</span>
                          </div>
                        </td>
                        <td className="p-2.5">{p.age}y • {p.height}</td>
                        <td className="p-2.5">{p.caste}</td>
                        <td className="p-2.5">{p.city}</td>
                        <td className="p-2.5 text-[#6E6466]">{p.phone}</td>
                        <td className="p-2.5 capitalize">{p.status.replace(/_/g, ' ')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Old Stock Report */}
      {activeTab === 'old_stock' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#A3182E]/10 border border-[#A3182E]/30 rounded-xl flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#A3182E]">
                Old Stock Alert: {oldStock.length} Profiles sitting unmatched for 91+ Days
              </h2>
              <p className="text-xs text-[#6E6466]">
                These candidates require proactive follow-up, preference widening, or active proposal dispatch.
              </p>
            </div>
            <span className="font-serif text-3xl font-bold text-[#A3182E]">{oldStock.length}</span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-xl overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#800F2F] text-[#F8F5F0] text-[11px] uppercase font-semibold">
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
              <tbody className="divide-y divide-[#E5DFD5]">
                {oldStock.map((item, idx) => (
                  <tr key={item.profile.id} className={idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#FAF7F2]'}>
                    <td className="p-2.5 font-bold font-serif text-[#800F2F]">{item.profile.formNo}</td>
                    <td className="p-2.5 font-semibold text-[#2C2526]">{item.profile.name}</td>
                    <td className="p-2.5">{item.profile.gender}, {item.profile.age}y</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#A3182E] text-[#F8F5F0]">
                        {item.daysInStock} days
                      </span>
                    </td>
                    <td className="p-2.5">{item.profile.caste}</td>
                    <td className="p-2.5">{item.profile.city}</td>
                    <td className="p-2.5 text-center font-bold text-[#800F2F]">{item.matchCount}</td>
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
          <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#D4AF37] flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#800F2F]">
                Total Successful Matrimonies: {finalizedList.length} Finalized Rishtay
              </h2>
              <p className="text-xs text-[#6E6466]">
                Proposals marked completed ("Rishta Done"), candidate profiles transitioned to engaged/married.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#6E6466] block uppercase">Success Rate</span>
              <span className="font-serif text-2xl font-bold text-[#D4AF37]">100%</span>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-xl overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#800F2F] text-[#F8F5F0] text-[11px] uppercase font-semibold">
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Candidate 1 (Name &amp; Form No)</th>
                  <th className="p-2.5">Candidate 2 (Name &amp; Form No)</th>
                  <th className="p-2.5">Compatibility Score</th>
                  <th className="p-2.5">Finalized Date</th>
                  <th className="p-2.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DFD5]">
                {finalizedList.map((pr, idx) => {
                  const pA = store.getProfileById(pr.profileAId);
                  const pB = store.getProfileById(pr.profileBId);
                  return (
                    <tr key={pr.id} className={idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#FAF7F2]'}>
                      <td className="p-2.5 font-bold font-serif text-[#800F2F]">{idx + 1}</td>
                      <td className="p-2.5 font-semibold text-[#2C2526]">
                        {pr.profileAName} {pA?.formNo ? <span className="text-[10px] text-[#800F2F] font-mono">({pA.formNo})</span> : ''}
                      </td>
                      <td className="p-2.5 font-semibold text-[#2C2526]">
                        {pr.profileBName} {pB?.formNo ? <span className="text-[10px] text-[#800F2F] font-mono">({pB.formNo})</span> : ''}
                      </td>
                      <td className="p-2.5 font-bold text-[#D4AF37]">{pr.matchScore}%</td>
                      <td className="p-2.5">{formatDate(pr.updatedAt)}</td>
                      <td className="p-2.5 text-[#6E6466] truncate max-w-xs">{pr.notes || 'Rishta finalized.'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Proposals Sent */}
      {activeTab === 'proposals' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E5DFD5]">
            <span className="text-xs font-bold text-[#800F2F]">
              {rangeProposals.length} formal proposals created or updated in selected timeframe.
            </span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-xl overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#800F2F] text-[#F8F5F0] text-[11px] uppercase font-semibold">
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Candidate A (Name &amp; Form No)</th>
                  <th className="p-2.5">Candidate B (Name &amp; Form No)</th>
                  <th className="p-2.5">Match Score</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Date Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DFD5]">
                {rangeProposals.map((pr, idx) => {
                  const pA = store.getProfileById(pr.profileAId);
                  const pB = store.getProfileById(pr.profileBId);
                  return (
                    <tr key={pr.id} className={idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#FAF7F2]'}>
                      <td className="p-2.5 font-bold font-serif text-[#800F2F]">{idx + 1}</td>
                      <td className="p-2.5 font-semibold text-[#2C2526]">
                        {pr.profileAName} {pA?.formNo ? <span className="text-[10px] text-[#800F2F] font-mono">({pA.formNo})</span> : ''}
                      </td>
                      <td className="p-2.5 font-semibold text-[#2C2526]">
                        {pr.profileBName} {pB?.formNo ? <span className="text-[10px] text-[#800F2F] font-mono">({pB.formNo})</span> : ''}
                      </td>
                      <td className="p-2.5 font-bold text-[#800F2F]">{pr.matchScore}%</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F8F5F0] border border-[#E5DFD5] capitalize">
                          {pr.status}
                        </span>
                      </td>
                      <td className="p-2.5">{formatDate(pr.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Financial Report */}
      {activeTab === 'financial' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E5DFD5]">
              <span className="text-[10px] text-[#6E6466] uppercase block font-semibold">Revenue Collected</span>
              <span className="font-serif text-3xl font-bold text-[#800F2F]">{formatPKR(totalRevenue)}</span>
            </div>
            <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E5DFD5]">
              <span className="text-[10px] text-[#6E6466] uppercase block font-semibold">Outstanding Receivables</span>
              <span className="font-serif text-3xl font-bold text-[#A3182E]">{formatPKR(totalOutstanding)}</span>
            </div>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-xl overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#800F2F] text-[#F8F5F0] text-[11px] uppercase font-semibold">
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
              <tbody className="divide-y divide-[#E5DFD5]">
                {rangeInvoices.map((inv, idx) => (
                  <tr key={inv.id} className={idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#FAF7F2]'}>
                    <td className="p-2.5 font-bold font-serif text-[#800F2F]">{inv.invoiceNumber}</td>
                    <td className="p-2.5 font-semibold text-[#2C2526]">{inv.clientName}</td>
                    <td className="p-2.5 capitalize">{inv.invoiceType}</td>
                    <td className="p-2.5">{inv.date}</td>
                    <td className="p-2.5 font-semibold">{formatPKR(inv.total)}</td>
                    <td className="p-2.5 text-[#800F2F] font-semibold">{formatPKR(inv.amountPaid)}</td>
                    <td className="p-2.5 font-bold text-[#A3182E]">{formatPKR(inv.balance)}</td>
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
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#6E6466]">Loading Bureau Reports...</div>}>
      <ReportsContent />
    </Suspense>
  );
}

