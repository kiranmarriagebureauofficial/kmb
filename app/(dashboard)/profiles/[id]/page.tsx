'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { store } from '@/lib/db/store';
import { Profile, Proposal } from '@/lib/types';
import { formatPKR, formatDate, maskCNIC } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { ProfilePrintView } from '@/components/profiles/ProfilePrintView';
import { exportSingleProfilePDF } from '@/lib/pdf-export';
import { 
  Sparkles, 
  Printer, 
  FileText,
  Edit, 
  Trash2, 
  Star, 
  MapPin, 
  Phone, 
  Building, 
  GraduationCap, 
  Briefcase, 
  Users, 
  ShieldCheck, 
  HeartHandshake,
  ArrowLeft
} from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

function ProfileDetailContent() {
  const { tr } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [profile, setProfile] = useState<Profile | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isPrintView, setIsPrintView] = useState(false);

  useEffect(() => {
    if (id) {
      setProfile(store.getProfileById(id));
      setCurrentUser(store.getCurrentUser());
      const allProps = store.getProposals().filter(
        pr => pr.profileAId === id || pr.profileBId === id
      );
      setProposals(allProps);
    }

    const unsub = store.subscribe(() => {
      if (id) {
        setProfile(store.getProfileById(id));
        setCurrentUser(store.getCurrentUser());
      }
    });
    return unsub;
  }, [id]);

  if (!profile) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="font-serif text-xl font-bold text-[#800F2F]">
          {tr('Profile Not Found', 'پروفائل نہیں ملی')}
        </h2>
        <Link href="/profiles" className="text-xs font-semibold text-[#800F2F] underline">
          {tr('Return to All Rishtas', 'تمام رشتوں پر واپس جائیں')}
        </Link>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin';

  if (isPrintView) {
    return (
      <div className="space-y-4">
        <div className="no-print flex items-center justify-between bg-[#FFFFFF] p-4 rounded-xl border border-[#E5DFD5]">
          <button
            onClick={() => setIsPrintView(false)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#800F2F]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{tr('Back to Profile Details', 'پروفائل تفصیلات پر واپس جائیں')}</span>
          </button>
          <span className="text-xs text-[#6E6466]">{tr('Print-Ready Official Layout', 'پرنٹ کے لیے تیار سرکاری فارم')}</span>
        </div>
        <ProfilePrintView profile={profile} onClose={() => setIsPrintView(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5DFD5] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <ProfileAvatar
            name={profile.name}
            photoUrl={profile.photoUrl}
            size="xl"
            isPremium={Boolean(profile.premiumMember)}
            className="shadow-md"
          />

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-serif text-2xl font-bold text-[#2C2526]">
                {profile.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-[#F8F5F0] text-[#800F2F] border border-[#D8D0C3]">
                {tr('Reg:', 'رجسٹر:')} {profile.formNo}
              </span>
              <Badge status={profile.status} />
              {profile.premiumMember && (
                <Badge variant="premium">{tr('Premium Member', 'پریمیم ممبر')}</Badge>
              )}
            </div>

            <p className="text-xs text-[#6E6466] flex items-center gap-2 flex-wrap">
              <span>{profile.gender === 'Male' ? tr('Male', 'مرد') : tr('Female', 'خاتون')}</span>
              <span>•</span>
              <span>{profile.age} {tr('Yrs', 'سال')} ({profile.height})</span>
              <span>•</span>
              <span className="font-semibold text-[#800F2F]">{profile.caste}</span>
              <span>•</span>
              <span>{profile.maslak}</span>
              <span>•</span>
              <span>{profile.maritalStatus}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/profiles/${profile.id}/matches`}>
            <Button size="sm" variant="primary" icon={<Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />}>
              {tr('View Matches', 'موزوں رشتے دیکھیں')}
            </Button>
          </Link>

          <Button
            size="sm"
            variant="accent"
            onClick={() => exportSingleProfilePDF(profile, store.getSettings())}
            icon={<FileText className="w-3.5 h-3.5 text-[#800F2F]" />}
          >
            {tr('Download Biodata PDF', 'بائیوڈیٹا پی ڈی ایف')}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsPrintView(true)}
            icon={<Printer className="w-3.5 h-3.5 text-[#800F2F]" />}
          >
            {tr('Print Form', 'فارم پرنٹ کریں')}
          </Button>

          <Link href={`/profiles/${profile.id}/edit`}>
            <Button size="sm" variant="secondary" icon={<Edit className="w-3.5 h-3.5 text-[#800F2F]" />}>
              {tr('Edit Profile', 'پروفائل ایڈٹ کریں')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Sections */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Personal & Family Background */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
              <h3 className="font-serif text-base font-bold text-[#800F2F]">
                {tr('1. Personal & Family Lineage', '1. ذاتی و خاندانی پس منظر')}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#6E6466] block">{tr('Father Name:', 'والد کا نام:')}</span>
                <span className="font-semibold text-[#2C2526]">{profile.fatherName}</span>
                <span className="text-[11px] text-[#6E6466] block">({profile.fatherOccupation})</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">{tr('Mother Name:', 'والدہ کا نام:')}</span>
                <span className="font-semibold text-[#2C2526]">{profile.motherName}</span>
                <span className="text-[11px] text-[#6E6466] block">({profile.motherOccupation || tr('Homemaker', 'خانہ دار')})</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">{tr('Siblings:', 'بہن بھائی:')}</span>
                <span className="font-semibold text-[#2C2526]">{tr('Total', 'کل')} {profile.totalSiblings}</span>
                <span className="text-[11px] text-[#6E6466] block">
                  {profile.brothersCount} {tr('Bros', 'بھائی')}, {profile.sistersCount} {tr('Sis', 'بہنیں')} ({profile.marriedSiblingsCount} {tr('Married', 'شادی شدہ')})
                </span>
              </div>

              <div>
                <span className="text-[#6E6466] block">{tr('Caste / Qaum:', 'ذات / قوم:')}</span>
                <span className="font-bold text-[#800F2F]">{profile.caste}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">{tr('Maslak / Sect:', 'مسلک / فرقہ:')}</span>
                <span className="font-semibold text-[#2C2526]">{profile.maslak}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">{tr('Religion:', 'مذہب:')}</span>
                <span className="font-semibold text-[#2C2526]">{profile.religion}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">{tr('City & Area:', 'شہر اور علاقہ:')}</span>
                <span className="font-semibold text-[#2C2526]">{profile.city}</span>
                <span className="text-[11px] text-[#6E6466] block">{profile.societyName || tr('Lahore', 'لاہور')}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">{tr('Date Applied:', 'تاریخ اندراج:')}</span>
                <span className="font-semibold text-[#2C2526]">{formatDate(profile.dateApplied)}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">{tr('Applied / Brought By:', 'درج کنندہ / حوالہ:')}</span>
                <span className="font-semibold text-[#2C2526]">{profile.appliedBy}</span>
              </div>
            </div>
          </div>

          {/* 2. Educational & Career Profile */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
              <h3 className="font-serif text-base font-bold text-[#800F2F]">
                {tr('2. Educational & Professional Standing', '2. تعلیمی و پیشہ ورانہ کوائف')}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <span className="text-[#6E6466] block">{tr('Degree & Institute:', 'ڈگری اور تعلیمی ادارہ:')}</span>
                <span className="font-bold text-[#2C2526] text-sm">{profile.degree}</span>
                <span className="text-[11px] text-[#800F2F] font-medium block">{profile.educationLevel}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">{tr('Monthly Income:', 'ماہانہ آمدنی:')}</span>
                <span className="font-bold text-[#800F2F] text-sm">{formatPKR(profile.monthlyIncome)}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">{tr('Profession:', 'پیشہ / کاروبار:')}</span>
                <span className="font-semibold text-[#2C2526]">{profile.profession}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">{tr('Designation:', 'عہدہ:')}</span>
                <span className="font-semibold text-[#2C2526]">{profile.designation || tr('N/A', 'موجود نہیں')}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">{tr('Experience:', 'تجربہ:')}</span>
                <span className="font-semibold text-[#2C2526]">
                  {profile.experienceYears ? `${profile.experienceYears} ${tr('Years', 'سال')}` : tr('N/A', 'موجود نہیں')}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Partner Preferences */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
              <h3 className="font-serif text-base font-bold text-[#800F2F]">
                {tr('3. Partner Preferences (Configured for Matching Engine)', '3. شریک حیات کی ترجیحات')}
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#6E6466] block">{tr('Preferred Age Range:', 'مطلوبہ عمر:')}</span>
                <span className="font-bold text-[#2C2526]">{profile.preferences.ageMin} – {profile.preferences.ageMax} {tr('Years', 'سال')}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">{tr('Minimum Education:', 'کم از کم تعلیم:')}</span>
                <span className="font-semibold text-[#2C2526]">{profile.preferences.educationMin}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">{tr('Acceptable Castes:', 'مطلوبہ ذات:')}</span>
                <span className="font-semibold text-[#800F2F]">{profile.preferences.castes.join(', ')}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">{tr('Preferred Cities:', 'مطلوبہ شہر:')}</span>
                <span className="font-semibold text-[#2C2526]">{profile.preferences.cities.join(', ')}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">{tr('Preferred Maslak:', 'مطلوبہ مسلک:')}</span>
                <span className="font-semibold text-[#2C2526]">{profile.preferences.maslak}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">{tr('Marital Statuses:', 'ازدواجی حیثیت:')}</span>
                <span className="font-semibold text-[#2C2526]">{profile.preferences.maritalStatuses.join(', ')}</span>
              </div>

              <div className="col-span-full pt-1">
                <span className="text-[#6E6466] block">{tr('Other Expectations / Notes:', 'دیگر خواہشات / نوٹس:')}</span>
                <p className="text-xs text-[#2C2526] italic bg-[#F8F5F0] p-2.5 rounded-lg border border-[#E5DFD5] mt-1">
                  {profile.preferences.otherNotes || tr('Respectable family background and cultural alignment.', 'معزز خاندان اور بہتر ہم آہنگی۔')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Confidential Contact & Internal Remarks */}
        <div className="lg:col-span-4 space-y-6">
          {/* Confidential Contact Box (Staff Only) */}
          <div className="bg-[#FFFFFF] rounded-2xl border-2 border-[#800F2F] p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-[#E5DFD5] pb-2 text-[#800F2F]">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-serif font-bold text-xs uppercase tracking-wider">
                {tr('Confidential Contact (Staff Only)', 'خفیہ رابطہ نمبر (صرف عملے کے لیے)')}
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[#6E6466] block text-[10px] uppercase font-bold">{tr('Primary Phone', 'بنیادی فون نمبر')}</span>
                <span className="font-bold text-[#800F2F] text-sm" dir="ltr">{profile.phone}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block text-[10px] uppercase font-bold">{tr('WhatsApp', 'واٹس ایپ')}</span>
                <span className="font-semibold text-[#2C2526]" dir="ltr">{profile.whatsapp}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block text-[10px] uppercase font-bold">{tr('Guardian', 'سرپرست')}</span>
                <span className="font-semibold text-[#2C2526]">
                  {profile.guardianName || tr('N/A', 'موجود نہیں')} (<span dir="ltr">{profile.guardianPhone || tr('N/A', 'موجود نہیں')}</span>)
                </span>
              </div>

              <div>
                <span className="text-[#6E6466] block text-[10px] uppercase font-bold">{tr('Home Address', 'گھر کا پتہ')}</span>
                <span className="text-[#2C2526]">{profile.address}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block text-[10px] uppercase font-bold">{tr('CNIC', 'شناختی کارڈ نمبر')}</span>
                <span className="font-mono text-[#2C2526]" dir="ltr">
                  {isAdmin ? profile.cnic || tr('N/A', 'موجود نہیں') : maskCNIC(profile.cnic)}
                </span>
              </div>
            </div>
          </div>

          {/* Internal Remarks */}
          <div className="bg-[#660A22] text-[#F8F5F0] rounded-2xl p-5 shadow-sm space-y-2 border border-[#D4AF37]/40">
            <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider block">
              {tr('Internal Office Remarks (Never Shared)', 'آفس کے اندرونی نوٹس (کبھی شیئر نہیں کیے جاتے)')}
            </span>
            <p className="text-xs text-[#E5DFD5] leading-relaxed italic">
              {profile.remarks || tr('No internal remarks logged.', 'کوئی اندرونی نوٹ درج نہیں ہے۔')}
            </p>
          </div>

          {/* Associated Proposals History */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] p-5 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 border-b border-[#E5DFD5] pb-2 text-[#800F2F]">
              <HeartHandshake className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-serif font-bold text-xs uppercase tracking-wider">
                {tr('Proposal Pipeline History', 'پروپوزل ہسٹری')}
              </h3>
            </div>

            {proposals.length === 0 ? (
              <p className="text-[11px] text-[#6E6466]">{tr('No active proposals logged yet for this candidate.', 'اس امیدوار کے لیے ابھی کوئی پروپوزل درج نہیں ہوا۔')}</p>
            ) : (
              <div className="space-y-2">
                {proposals.map(pr => (
                  <div key={pr.id} className="p-2.5 rounded-lg bg-[#F8F5F0] border border-[#E5DFD5] space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#800F2F] truncate max-w-[150px]">
                        {pr.profileAId === profile.id ? pr.profileBName : pr.profileAName}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-[#D4AF37] bg-[#800F2F] px-1.5 py-0.5 rounded">
                        {pr.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#6E6466]">
                      {tr('Sent on', 'بھیجا گیا')} {formatDate(pr.sentDate || pr.createdAt)} {tr('by', 'از')} {pr.sentBy || tr('Staff', 'عملہ')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileDetailPage() {
  const { tr } = useLanguage();
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#6E6466]">{tr('Loading candidate profile...', 'امیدوار کا پروفائل لوڈ ہو رہا ہے...')}</div>}>
      <ProfileDetailContent />
    </Suspense>
  );
}
