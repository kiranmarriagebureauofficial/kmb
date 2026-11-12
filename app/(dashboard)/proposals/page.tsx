'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { store } from '@/lib/db/store';
import { useLanguage } from '@/lib/useLanguage';
import { Proposal, ProposalStatus } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MarkRishtaDoneModal } from '@/components/proposals/MarkRishtaDoneModal';
import { 
  HeartHandshake, 
  Calendar, 
  Clock, 
  Check, 
  Star, 
  MessageSquare, 
  User, 
  Filter, 
  Plus,
  Heart
} from 'lucide-react';

export default function ProposalsLogPage() {
  const { tr } = useLanguage();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [activeFinalizeProposal, setActiveFinalizeProposal] = useState<Proposal | null>(null);

  const update = () => {
    setProposals(store.getProposals());
  };

  useEffect(() => {
    update();
    const unsub = store.subscribe(update);
    return unsub;
  }, []);

  const filteredProposals = proposals.filter(p => {
    if (filterStatus !== 'All' && p.status !== filterStatus) return false;
    return true;
  });

  const handleStatusChange = (id: string, status: ProposalStatus) => {
    store.updateProposal(id, { status });
  };

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case 'finalized':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D4AF37] text-[#660A22]">
            <Star className="w-3 h-3 fill-[#660A22]" />
            <span>{tr('Rishta Done / Finalized', 'رشتہ طے / مکمل')}</span>
          </span>
        );
      case 'meeting_scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFFFF] text-[#800F2F] border border-[#D4AF37]">
            <Calendar className="w-3 h-3 text-[#D4AF37]" />
            <span>{tr('Meeting Scheduled', 'ملاقات طے ہے')}</span>
          </span>
        );
      case 'interested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFFFF] text-[#800F2F] border border-[#800F2F]">
            <Check className="w-3 h-3 text-[#D4AF37]" />
            <span>{tr('Family Interested', 'خاندان دلچسپی رکھتا ہے')}</span>
          </span>
        );
      case 'waiting':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F8F5F0] text-[#6E6466] border border-[#D8D0C3]">
            <Clock className="w-3 h-3 text-[#6E6466]" />
            <span>{tr('Waiting for Response', 'جواب کا انتظار')}</span>
          </span>
        );
      case 'not_interested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFFFFF] text-[#A3182E] border border-[#A3182E]/40">
            <span>{tr('Not Interested', 'عدم دلچسپی')}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5DFD5] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-serif font-bold tracking-widest text-[#B88B22]">
            {tr('Matrimonial Pipeline', 'تجاویزِ رشتہ کا ریکارڈ')}
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#800F2F] mt-0.5">
            {tr('Proposals & Family Sittings Log', 'رشتہ تجاویز اور خاندانی ملاقاتوں کا لاگ')} ({filteredProposals.length})
          </h1>
          <p className="text-xs text-[#6E6466]">
            {tr('Track initiated proposals, parental responses, scheduled office sittings, and finalize completed rishtas.', 'بھیجے گئے رشتوں، والدین کے جوابات، ملاقاتوں اور طے شدہ رشتوں کی مکمل تفصیل۔')}
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs">
          <label className="font-semibold text-[#6E6466]">{tr('Status:', 'حیثیت:')}</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
          >
            <option value="All">{tr('All Proposals', 'تمام تجاویز')}</option>
            <option value="waiting">{tr('Waiting for Response', 'جواب کا انتظار')}</option>
            <option value="interested">{tr('Family Interested', 'خاندان دلچسپی رکھتا ہے')}</option>
            <option value="meeting_scheduled">{tr('Meeting Scheduled', 'ملاقات طے ہے')}</option>
            <option value="finalized">{tr('Finalized (Rishta Done)', 'طے شدہ / رشتہ مکمل')}</option>
            <option value="not_interested">{tr('Not Interested', 'عدم دلچسپی')}</option>
          </select>
        </div>
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <div className="p-16 text-center bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl space-y-3">
          <HeartHandshake className="w-12 h-12 text-[#D8D0C3] mx-auto" />
          <h3 className="font-serif text-base font-bold text-[#800F2F]">
            {tr('No Proposals Found', 'کوئی رشتہ تجویز موجود نہیں')}
          </h3>
          <p className="text-xs text-[#6E6466] max-w-sm mx-auto">
            {tr('Proposals can be initiated from any candidate’s Matches page or the Premium Rishtay directory.', 'کسی بھی امیدوار کے میچز یا پریمیم رشتے صفحہ سے رشتہ تجویز کیا جا سکتا ہے۔')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map(prop => (
            <div
              key={prop.id}
              className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-sm hover:shadow-md transition-all space-y-4 border-s-4 border-s-[#800F2F]"
            >
              {/* Top Row: Parties & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DFD5] pb-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 font-serif font-bold text-base text-[#800F2F]">
                    <span>{prop.profileAName}</span>
                    <HeartHandshake className="w-4 h-4 text-[#D4AF37]" />
                    <span>{prop.profileBName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(prop.status)}
                </div>
              </div>

              {/* Middle Row: Details, Handler & Follow-Up */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6E6466] block">{tr('Sent Information', 'بھیجنے کی تفصیل')}</span>
                  <p className="text-[#2C2526]">
                    {tr('Date:', 'تاریخ:')} <strong>{formatDate(prop.sentDate || prop.createdAt)}</strong>
                  </p>
                  <p className="text-[#6E6466]">{tr('Handled By:', 'ذمہ دار:')} {prop.sentBy || tr('Staff', 'عملہ')}</p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6E6466] block">{tr('Follow-Up Reminder', 'فالو اپ یاددہانی')}</span>
                  <p className="font-semibold text-[#800F2F]">
                    {prop.followUpDate ? formatDate(prop.followUpDate) : tr('No reminder scheduled', 'کوئی یاددہانی مقرر نہیں')}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6E6466] block">{tr('Change Status', 'حیثیت تبدیل کریں')}</span>
                  <select
                    value={prop.status}
                    onChange={(e) => handleStatusChange(prop.id, e.target.value as ProposalStatus)}
                    className="mt-0.5 px-2.5 py-1 rounded border border-[#E5DFD5] bg-[#F8F5F0] text-xs font-semibold text-[#800F2F]"
                  >
                    <option value="waiting">{tr('Waiting for Response', 'جواب کا انتظار')}</option>
                    <option value="interested">{tr('Family Interested', 'خاندان دلچسپی رکھتا ہے')}</option>
                    <option value="meeting_scheduled">{tr('Meeting Scheduled', 'ملاقات طے ہے')}</option>
                    <option value="finalized">{tr('Finalized', 'طے شدہ')}</option>
                    <option value="not_interested">{tr('Not Interested', 'عدم دلچسپی')}</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              {prop.notes && (
                <div className="p-3 bg-[#F8F5F0] rounded-xl border border-[#E5DFD5] text-xs text-[#2C2526]">
                  <span className="font-semibold text-[#800F2F]">{tr('Coordinator Notes:', 'نوٹس:')}</span>{' '}
                  <span className="text-[#6E6466]">{prop.notes}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#E5DFD5]/60">
                <div className="flex items-center gap-2">
                  <Link href={`/profiles/${prop.profileAId}`}>
                    <Button size="sm" variant="ghost">{tr('View Party A', 'فریق اول دیکھیں')}</Button>
                  </Link>
                  <Link href={`/profiles/${prop.profileBId}`}>
                    <Button size="sm" variant="ghost">{tr('View Party B', 'فریق دوم دیکھیں')}</Button>
                  </Link>
                </div>

                {prop.status !== 'finalized' && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setActiveFinalizeProposal(prop)}
                    icon={<Heart className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />}
                  >
                    {tr('Mark as Rishta Done (Finalize)', 'رشتہ طے شدہ قرار دیں')}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mark Rishta Done Modal */}
      {activeFinalizeProposal && (
        <MarkRishtaDoneModal
          proposal={activeFinalizeProposal}
          onClose={() => setActiveFinalizeProposal(null)}
          onSuccess={() => {
            update();
          }}
        />
      )}
    </div>
  );
}

