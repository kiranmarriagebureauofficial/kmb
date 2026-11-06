'use client';

import React, { useState } from 'react';
import { Profile, ProposalStatus } from '@/lib/types';
import { store } from '@/lib/db/store';
import { Button } from '../ui/Button';
import { HeartHandshake, X, Calendar, User, FileText } from 'lucide-react';

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
              Initiate & Log Rishta Proposal
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
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-[#6E6466]">Party A</span>
              <p className="font-bold text-[#800F2F]">{profileA.name}</p>
              <span className="text-[10px] text-[#6E6466]">{profileA.formNo}</span>
            </div>

            <HeartHandshake className="w-6 h-6 text-[#D4AF37]" />

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#6E6466]">Party B</span>
              <p className="font-bold text-[#800F2F]">{profileB.name}</p>
              <span className="text-[10px] text-[#6E6466]">{profileB.formNo}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">
                Proposal Sent Date *
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
                Handled By *
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
                Initial Response Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProposalStatus)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
              >
                <option value="waiting">Waiting for Response</option>
                <option value="interested">Family Interested</option>
                <option value="meeting_scheduled">Meeting Scheduled</option>
                <option value="not_interested">Not Interested</option>
                <option value="finalized">Finalized</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">
                Follow-Up Reminder Date
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
              Internal Proposal Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sent sanitized WhatsApp bio to mother; awaiting response on meeting..."
              className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
            />
          </div>

          <div className="pt-3 border-t border-[#E5DFD5] flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              icon={<HeartHandshake className="w-4 h-4 text-[#D4AF37]" />}
            >
              {saving ? 'Logging...' : 'Save & Track Proposal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

