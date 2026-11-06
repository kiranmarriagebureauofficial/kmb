'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { store } from '@/lib/db/store';
import { Profile } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Inbox, 
  Check, 
  X, 
  AlertTriangle, 
  Eye, 
  Edit, 
  Clock, 
  Phone, 
  MapPin, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function RequestsInboxPage() {
  const [pendingList, setPendingList] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Duplicate submission or unverified phone number');

  const update = () => {
    setPendingList(store.getPendingRequests());
  };

  useEffect(() => {
    update();
    const unsub = store.subscribe(update);
    return unsub;
  }, []);

  const handleApprove = (id: string, formNo: string) => {
    store.updateProfileStatus(id, 'active');
    alert(`Submission ${formNo} approved! It has now entered the active matching engine.`);
  };

  const handleRejectConfirm = () => {
    if (selectedProfile) {
      store.updateProfileStatus(selectedProfile.id, 'rejected', rejectReason);
      setRejectModalOpen(false);
      setSelectedProfile(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#FFFDF8] p-5 rounded-2xl border border-[#E9DDC3] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-serif font-bold tracking-widest text-[#B08626]">
            Intake Verification Queue
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#5A0A14] mt-0.5">
            Online Registration Requests Inbox ({pendingList.length})
          </h1>
          <p className="text-xs text-[#7B5E5E]">
            Submissions via public website. Review candidate details, verify duplicate phone alerts, and approve into active matching.
          </p>
        </div>
      </div>

      {/* Requests List */}
      {pendingList.length === 0 ? (
        <div className="p-16 text-center bg-[#FFFDF8] border border-[#E9DDC3] rounded-2xl space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#FBF4E6] text-[#D9A93F] border border-[#DECEAC] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-[#5A0A14]" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#5A0A14]">
            All Online Requests Processed!
          </h3>
          <p className="text-xs text-[#7B5E5E] max-w-md mx-auto">
            There are currently no pending submissions in the queue. New submissions from <code>/register</code> will instantly appear here with sidebar badge alert.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingList.map(item => {
            const dup = store.checkDuplicatePhone(item.phone, item.id);

            return (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC3] shadow-sm hover:shadow-md transition-all space-y-4 border-l-4 border-l-[#D9A93F]"
              >
                {/* Top Status & Duplicate Alert */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E9DDC3] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-[#5A0A14] bg-[#FBF4E6] px-2.5 py-1 rounded border border-[#DECEAC]">
                      {item.formNo}
                    </span>
                    <Badge status="pending_approval" />
                    <span className="text-xs text-[#7B5E5E]">
                      Submitted: {formatDate(item.dateApplied)} ({item.appliedBy})
                    </span>
                  </div>

                  {dup && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FBF4E6] text-[#8E1B2B] border border-[#8E1B2B]/40">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#8E1B2B]" />
                      <span>Duplicate Warning: Phone matches {dup.formNo} ({dup.name})</span>
                    </div>
                  )}
                </div>

                {/* Candidate Content Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#7B5E5E] block">Candidate</span>
                    <h3 className="font-bold text-sm text-[#2A0A0F]">{item.name}</h3>
                    <p className="text-[#7B5E5E]">
                      {item.gender} • {item.age} Yrs • {item.height} • {item.maritalStatus}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#7B5E5E] block">Caste & Maslak</span>
                    <p className="font-semibold text-[#5A0A14]">{item.caste}</p>
                    <p className="text-[#7B5E5E]">{item.maslak}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#7B5E5E] block">Education & Job</span>
                    <p className="font-semibold text-[#2A0A0F]">{item.degree}</p>
                    <p className="text-[#7B5E5E]">{item.profession} ({item.educationLevel})</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#7B5E5E] block">Contact & City</span>
                    <p className="font-bold text-[#5A0A14]">{item.phone}</p>
                    <p className="text-[#7B5E5E]">{item.city} ({item.societyName || 'Lahore'})</p>
                  </div>
                </div>

                {/* Partner Preferences Box */}
                <div className="p-3 bg-[#FBF4E6] rounded-xl border border-[#E9DDC3] text-xs">
                  <span className="font-semibold text-[#5A0A14]">Partner Preferences Specified:</span>{' '}
                  <span className="text-[#7B5E5E]">
                    Age: {item.preferences.ageMin}-{item.preferences.ageMax} yrs • Caste: {item.preferences.castes.join(', ')} • Sect: {item.preferences.maslak} • Min Edu: {item.preferences.educationMin}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Link href={`/profiles/${item.id}`}>
                      <Button size="sm" variant="secondary" icon={<Eye className="w-3.5 h-3.5 text-[#5A0A14]" />}>
                        Inspect Details
                      </Button>
                    </Link>

                    <Link href={`/profiles/${item.id}/edit`}>
                      <Button size="sm" variant="secondary" icon={<Edit className="w-3.5 h-3.5 text-[#5A0A14]" />}>
                        Edit Fields
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        setSelectedProfile(item);
                        setRejectModalOpen(true);
                      }}
                      icon={<X className="w-3.5 h-3.5" />}
                    >
                      Reject Submission
                    </Button>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleApprove(item.id, item.formNo)}
                      icon={<Check className="w-3.5 h-3.5 text-[#D9A93F]" />}
                    >
                      Approve & Enter Matching Engine
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalOpen && selectedProfile && (
        <div className="fixed inset-0 z-50 bg-[#2A0A0F]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] border border-[#E9DDC3] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="font-serif text-base font-bold text-[#8E1B2B]">
              Reject Online Submission ({selectedProfile.formNo})
            </h3>
            <p className="text-[11px] text-[#7B5E5E]">
              Candidate: <strong>{selectedProfile.name}</strong> ({selectedProfile.phone}). Please state reason for audit record.
            </p>

            <div>
              <label className="block font-semibold text-[#5A0A14] mb-1">
                Reason for Rejection:
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E9DDC3]">
              <Button size="sm" variant="secondary" onClick={() => setRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={handleRejectConfirm}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
