'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { store } from '@/lib/db/store';
import { Profile } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
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
import { useLanguage } from '@/lib/useLanguage';

export default function RequestsInboxPage() {
  const { tr } = useLanguage();
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
    store.updateProfileStatus(id, 'available');
    alert(
      tr(
        `Submission ${formNo} approved! It has now entered the active inventory stock.`,
        `درخواست ${formNo} منظور ہو گئی! اب یہ فعال اسٹاک میں شامل ہو چکی ہے۔`
      )
    );
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
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5DFD5] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-serif font-bold tracking-widest text-[#B88B22]">
            {tr('Intake Verification Queue', 'تصدیق کے منتظر فارمز')}
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#800F2F] mt-0.5">
            {tr(
              `Online Registration Requests Inbox (${pendingList.length})`,
              `آن لائن رجسٹریشن درخواستوں کا ان باکس (${pendingList.length})`
            )}
          </h1>
          <p className="text-xs text-[#6E6466]">
            {tr(
              'Submissions via public website. Review candidate details, verify duplicate phone alerts, and approve into active matching.',
              'آن لائن فارم سے موصول ہونے والی درخواستیں۔ تفصیلات کا جائزہ لیں، ڈپلیکیٹ فون نمبر چیک کریں اور میچنگ کے لیے منظور کریں۔'
            )}
          </p>
        </div>
      </div>

      {/* Requests List */}
      {pendingList.length === 0 ? (
        <div className="p-16 text-center bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#F8F5F0] text-[#D4AF37] border border-[#D8D0C3] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-[#800F2F]" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#800F2F]">
            {tr('All Online Requests Processed!', 'تمام آن لائن درخواستیں نمٹا دی گئی ہیں!')}
          </h3>
          <p className="text-xs text-[#6E6466] max-w-md mx-auto">
            {tr(
              'There are currently no pending submissions in the queue. New submissions from /register will instantly appear here with sidebar badge alert.',
              'اس وقت کوئی زیر التواء درخواست موجود نہیں ہے۔ /register سے آنے والی نئی درخواستیں فوراً یہاں اور سائیڈ بار بیج پر ظاہر ہوں گی۔'
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingList.map(item => {
            const dup = store.checkDuplicatePhone(item.phone, item.id);

            return (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-sm hover:shadow-md transition-all space-y-4 border-s-4 border-s-[#D4AF37]"
              >
                {/* Top Status & Duplicate Alert */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DFD5] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-[#800F2F] bg-[#F8F5F0] px-2.5 py-1 rounded border border-[#D8D0C3]">
                      {item.formNo}
                    </span>
                    <Badge status="pending_approval" />
                    <span className="text-xs text-[#6E6466]">
                      {tr('Submitted:', 'موصول شدہ:')} {formatDate(item.dateApplied)} ({item.appliedBy})
                    </span>
                  </div>

                  {dup && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F8F5F0] text-[#A3182E] border border-[#A3182E]/40">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#A3182E]" />
                      <span>
                        {tr(
                          `Duplicate Warning: Phone matches ${dup.formNo} (${dup.name})`,
                          `ڈپلیکیٹ الرٹ: یہ فون نمبر ${dup.formNo} (${dup.name}) سے ملتا ہے`
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Candidate Content Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div className="flex items-start gap-3">
                    <ProfileAvatar
                      name={item.name}
                      photoUrl={item.photoUrl}
                      size="md"
                      isPremium={Boolean(item.premiumMember)}
                    />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6E6466] block">{tr('Candidate', 'امیدوار')}</span>
                      <h3 className="font-bold text-sm text-[#2C2526]">{item.name}</h3>
                      <p className="text-[#6E6466]">
                        {item.gender === 'Male' ? tr('Male', 'مرد') : tr('Female', 'خاتون')} • {item.age} {tr('Yrs', 'سال')} • {item.height} • {item.maritalStatus}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6E6466] block">{tr('Caste & Maslak', 'ذات اور مسلک')}</span>
                    <p className="font-semibold text-[#800F2F]">{item.caste}</p>
                    <p className="text-[#6E6466]">{item.maslak}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6E6466] block">{tr('Education & Job', 'تعلیم اور روزگار')}</span>
                    <p className="font-semibold text-[#2C2526]">{item.degree}</p>
                    <p className="text-[#6E6466]">{item.profession} ({item.educationLevel})</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#6E6466] block">{tr('Contact & City', 'رابطہ اور شہر')}</span>
                    <p className="font-bold text-[#800F2F]" dir="ltr">{item.phone}</p>
                    <p className="text-[#6E6466]">{item.city} ({item.societyName || tr('Lahore', 'لاہور')})</p>
                  </div>
                </div>

                {/* Partner Preferences Box */}
                <div className="p-3 bg-[#F8F5F0] rounded-xl border border-[#E5DFD5] text-xs">
                  <span className="font-semibold text-[#800F2F]">{tr('Partner Preferences Specified:', 'شریک حیات کی بیان کردہ ترجیحات:')}</span>{' '}
                  <span className="text-[#6E6466]">
                    {tr('Age:', 'عمر:')} {item.preferences.ageMin}-{item.preferences.ageMax} {tr('yrs', 'سال')} • {tr('Caste:', 'ذات:')} {item.preferences.castes.join(', ')} • {tr('Sect:', 'مسلک:')} {item.preferences.maslak} • {tr('Min Edu:', 'کم از کم تعلیم:')} {item.preferences.educationMin}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <Link href={`/profiles/${item.id}`}>
                      <Button size="sm" variant="secondary" icon={<Eye className="w-3.5 h-3.5 text-[#800F2F]" />}>
                        {tr('Inspect Details', 'تفصیلات دیکھیں')}
                      </Button>
                    </Link>

                    <Link href={`/profiles/${item.id}/edit`}>
                      <Button size="sm" variant="secondary" icon={<Edit className="w-3.5 h-3.5 text-[#800F2F]" />}>
                        {tr('Edit Fields', 'ایڈٹ کریں')}
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
                      {tr('Reject Submission', 'درخواست مسترد کریں')}
                    </Button>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleApprove(item.id, item.formNo)}
                      icon={<Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                    >
                      {tr('Approve & Enter Matching Engine', 'منظور کریں اور میچنگ میں شامل کریں')}
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
        <div className="fixed inset-0 z-50 bg-[#2C2526]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="font-serif text-base font-bold text-[#A3182E]">
              {tr(`Reject Online Submission (${selectedProfile.formNo})`, `آن لائن درخواست مسترد کریں (${selectedProfile.formNo})`)}
            </h3>
            <p className="text-[11px] text-[#6E6466]">
              {tr('Candidate:', 'امیدوار:')} <strong>{selectedProfile.name}</strong> (<span dir="ltr">{selectedProfile.phone}</span>).{' '}
              {tr('Please state reason for audit record.', 'براہ کرم آڈٹ ریکارڈ کے لیے وجہ تحریر کریں۔')}
            </p>

            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">
                {tr('Reason for Rejection:', 'مسترد کرنے کی وجہ:')}
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5DFD5]">
              <Button size="sm" variant="secondary" onClick={() => setRejectModalOpen(false)}>
                {tr('Cancel', 'منسوخ کریں')}
              </Button>
              <Button size="sm" variant="danger" onClick={handleRejectConfirm}>
                {tr('Confirm Rejection', 'مسترد کرنے کی تصدیق کریں')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

