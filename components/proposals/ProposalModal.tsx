'use client';

import React, { useState } from 'react';
import { Profile, ProposalStatus } from '@/lib/types';
import { store } from '@/lib/db/store';
import { Button } from '../ui/Button';
import { HeartHandshake, X, Calendar, User, FileText } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

interface ProposalModalProps {
  profileA: Profile;
  profileB: Profile;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProposalModal({
  profileA,
  profileB,
  onClose,
  onSuccess,
}: ProposalModalProps) {
  const { tr } = useLanguage();
  const currentUser = store.getCurrentUser();
  const [sentBy, setSentBy] = useState(currentUser?.name || 'Begum Kiran Shah');
  const [sentDate, setSentDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<ProposalStatus>('waiting');
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      store.addProposal({
        profileAId: profileA.id,
        profileBId: profileB.id,
        profileAName: `${profileA.name} (${profileA.formNo})`,
        profileBName: `${profileB.name} (${profileB.formNo})`,
        sentDate,
        sentBy,
        status,
        followUpDate: followUpDate || undefined,
        notes: notes || undefined,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create proposal:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2C2526]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#800F2F] text-[#F8F5F0] p-4 flex items-center justify-between border-b border-[#D4AF37]">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-serif text-base font-bold tracking-wide">
              {tr('Initiate & Log Rishta Proposal', 'رشتہ پروپوزل شروع اور ریکارڈ کریں')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#660A22] text-[#E5DFD5]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Pair Preview */}
          <div className="p-3 bg-[#F8F5F0] rounded-xl border border-[#E5DFD5] flex items-center justify-between">
            <div className="text-start">
              <span className="text-[10px] uppercase font-bold text-[#6E6466]">{tr('Party A', 'فریق اول')}</span>
              <p className="font-bold text-[#800F2F]">{profileA.name}</p>
              <span className="text-[10px] text-[#6E6466]">{profileA.formNo}</span>
            </div>

            <HeartHandshake className="w-6 h-6 text-[#D4AF37]" />

            <div className="text-end">
              <span className="text-[10px] uppercase font-bold text-[#6E6466]">{tr('Party B', 'فریق دوم')}</span>
              <p className="font-bold text-[#800F2F]">{profileB.name}</p>
              <span className="text-[10px] text-[#6E6466]">{profileB.formNo}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">
                {tr('Proposal Sent Date *', 'پروپوزل بھیجنے کی تاریخ *')}
              </label>
              <input
                type="date"
                required
                value={sentDate}
                onChange={(e) => setSentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">
                {tr('Handled By *', 'نگران عملہ *')}
              </label>
              <input
                type="text"
                required
                value={sentBy}
                onChange={(e) => setSentBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">
                {tr('Initial Response Status', 'ابتدائی ردِعمل اسٹیٹس')}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProposalStatus)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
              >
                <option value="waiting">{tr('Waiting for Response', 'جواب کا انتظار')}</option>
                <option value="interested">{tr('Family Interested', 'خاندان راضی/دلچسپی')}</option>
                <option value="meeting_scheduled">{tr('Meeting Scheduled', 'ملاقات طے')}</option>
                <option value="not_interested">{tr('Not Interested', 'غیر متفق')}</option>
                <option value="finalized">{tr('Finalized', 'طے شدہ')}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">
                {tr('Follow-Up Reminder Date', 'فالو اپ یاددہانی کی تاریخ')}
              </label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#800F2F] mb-1">
              {tr('Internal Proposal Notes', 'پروپوزل کے اندرونی نوٹس')}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={tr(
                'e.g. Sent sanitized WhatsApp bio to mother; awaiting response on meeting...',
                'مثال: والدہ کو واٹس ایپ پر بائیوڈیٹا بھیجا گیا؛ ملاقات کے جواب کا انتظار ہے...'
              )}
              className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
            />
          </div>

          <div className="pt-3 border-t border-[#E5DFD5] flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              {tr('Cancel', 'منسوخ')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              icon={<HeartHandshake className="w-4 h-4 text-[#D4AF37]" />}
            >
              {saving
                ? tr('Logging...', 'محفوظ ہو رہا ہے...')
                : tr('Save & Track Proposal', 'پروپوزل محفوظ کریں')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

