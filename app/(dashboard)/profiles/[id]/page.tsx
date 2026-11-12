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

function ProfileDetailContent() {
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
          Profile Not Found
        </h2>
        <Link href="/profiles" className="text-xs font-semibold text-[#800F2F] underline">
          Return to All Rishtas
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
            <span>Back to Profile Details</span>
          </button>
          <span className="text-xs text-[#6E6466]">Print-Ready Official Layout</span>
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
                Reg: {profile.formNo}
              </span>
              <Badge status={profile.status} />
              {profile.premiumMember && (
                <Badge variant="premium">Premium Member</Badge>
              )}
            </div>

            <p className="text-xs text-[#6E6466] flex items-center gap-2 flex-wrap">
              <span>{profile.gender}</span>
              <span>•</span>
              <span>{profile.age} Yrs ({profile.height})</span>
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
              View Matches
            </Button>
          </Link>

          <Button
            size="sm"
            variant="accent"
            onClick={() => exportSingleProfilePDF(profile, store.getSettings())}
            icon={<FileText className="w-3.5 h-3.5 text-[#800F2F]" />}
          >
            Download Biodata PDF
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsPrintView(true)}
            icon={<Printer className="w-3.5 h-3.5 text-[#800F2F]" />}
          >
            Print Form
          </Button>

          <Link href={`/profiles/${profile.id}/edit`}>
            <Button size="sm" variant="secondary" icon={<Edit className="w-3.5 h-3.5 text-[#800F2F]" />}>
              Edit Profile
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
                1. Personal & Family Lineage
              </h3>
              <span className="text-xs font-urdu text-[#6E6466]">ذاتی و خاندانی پس منظر</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#6E6466] block">Father Name:</span>
                <span className="font-semibold text-[#2C2526]">{profile.fatherName}</span>
                <span className="text-[11px] text-[#6E6466] block">({profile.fatherOccupation})</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">Mother Name:</span>
                <span className="font-semibold text-[#2C2526]">{profile.motherName}</span>
                <span className="text-[11px] text-[#6E6466] block">({profile.motherOccupation || 'Homemaker'})</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">Siblings:</span>
                <span className="font-semibold text-[#2C2526]">Total {profile.totalSiblings}</span>
                <span className="text-[11px] text-[#6E6466] block">
                  {profile.brothersCount} Bros, {profile.sistersCount} Sis ({profile.marriedSiblingsCount} Married)
                </span>
              </div>

              <div>
                <span className="text-[#6E6466] block">Caste / Qaum:</span>
                <span className="font-bold text-[#800F2F]">{profile.caste}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">Maslak / Sect:</span>
                <span className="font-semibold text-[#2C2526]">{profile.maslak}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">Religion:</span>
                <span className="font-semibold text-[#2C2526]">{profile.religion}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">City & Area:</span>
                <span className="font-semibold text-[#2C2526]">{profile.city}</span>
                <span className="text-[11px] text-[#6E6466] block">{profile.societyName || 'Lahore'}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">Date Applied:</span>
                <span className="font-semibold text-[#2C2526]">{formatDate(profile.dateApplied)}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">Applied / Brought By:</span>
                <span className="font-semibold text-[#2C2526]">{profile.appliedBy}</span>
              </div>
            </div>
          </div>

          {/* 2. Educational & Career Profile */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
              <h3 className="font-serif text-base font-bold text-[#800F2F]">
                2. Educational & Professional Standing
              </h3>
              <span className="text-xs font-urdu text-[#6E6466]">تعلیمی و پیشہ ورانہ کوائف</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <span className="text-[#6E6466] block">Degree & Institute:</span>
                <span className="font-bold text-[#2C2526] text-sm">{profile.degree}</span>
                <span className="text-[11px] text-[#800F2F] font-medium block">{profile.educationLevel}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">Monthly Income:</span>
                <span className="font-bold text-[#800F2F] text-sm">{formatPKR(profile.monthlyIncome)}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">Profession:</span>
                <span className="font-semibold text-[#2C2526]">{profile.profession}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">Designation:</span>
                <span className="font-semibold text-[#2C2526]">{profile.designation || 'N/A'}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">Experience:</span>
                <span className="font-semibold text-[#2C2526]">
                  {profile.experienceYears ? `${profile.experienceYears} Years` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Partner Preferences */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
              <h3 className="font-serif text-base font-bold text-[#800F2F]">
                3. Partner Preferences (Configured for Matching Engine)
              </h3>
              <span className="text-xs font-urdu text-[#6E6466]">شریک حیات کی ترجیحات</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#6E6466] block">Preferred Age Range:</span>
                <span className="font-bold text-[#2C2526]">{profile.preferences.ageMin} – {profile.preferences.ageMax} Years</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">Minimum Education:</span>
                <span className="font-semibold text-[#2C2526]">{profile.preferences.educationMin}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">Acceptable Castes:</span>
                <span className="font-semibold text-[#800F2F]">{profile.preferences.castes.join(', ')}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">Preferred Cities:</span>
                <span className="font-semibold text-[#2C2526]">{profile.preferences.cities.join(', ')}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">Preferred Maslak:</span>
                <span className="font-semibold text-[#2C2526]">{profile.preferences.maslak}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block">Marital Statuses:</span>
                <span className="font-semibold text-[#2C2526]">{profile.preferences.maritalStatuses.join(', ')}</span>
              </div>

              <div className="col-span-full pt-1">
                <span className="text-[#6E6466] block">Other Expectations / Notes:</span>
                <p className="text-xs text-[#2C2526] italic bg-[#F8F5F0] p-2.5 rounded-lg border border-[#E5DFD5] mt-1">
                  {profile.preferences.otherNotes || 'Respectable family background and cultural alignment.'}
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
                Confidential Contact (Staff Only)
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[#6E6466] block text-[10px] uppercase font-bold">Primary Phone</span>
                <span className="font-bold text-[#800F2F] text-sm">{profile.phone}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block text-[10px] uppercase font-bold">WhatsApp</span>
                <span className="font-semibold text-[#2C2526]">{profile.whatsapp}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block text-[10px] uppercase font-bold">Guardian</span>
                <span className="font-semibold text-[#2C2526]">
                  {profile.guardianName || 'N/A'} ({profile.guardianPhone || 'N/A'})
                </span>
              </div>

              <div>
                <span className="text-[#6E6466] block text-[10px] uppercase font-bold">Home Address</span>
                <span className="text-[#2C2526]">{profile.address}</span>
              </div>

              <div>
                <span className="text-[#6E6466] block text-[10px] uppercase font-bold">CNIC</span>
                <span className="font-mono text-[#2C2526]">
                  {isAdmin ? profile.cnic || 'N/A' : maskCNIC(profile.cnic)}
                </span>
              </div>
            </div>
          </div>

          {/* Internal Remarks */}
          <div className="bg-[#660A22] text-[#F8F5F0] rounded-2xl p-5 shadow-sm space-y-2 border border-[#D4AF37]/40">
            <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider block">
              Internal Office Remarks (Never Shared)
            </span>
            <p className="text-xs text-[#E5DFD5] leading-relaxed italic">
              {profile.remarks || 'No internal remarks logged.'}
            </p>
          </div>

          {/* Associated Proposals History */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] p-5 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 border-b border-[#E5DFD5] pb-2 text-[#800F2F]">
              <HeartHandshake className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-serif font-bold text-xs uppercase tracking-wider">
                Proposal Pipeline History
              </h3>
            </div>

            {proposals.length === 0 ? (
              <p className="text-[11px] text-[#6E6466]">No active proposals logged yet for this candidate.</p>
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
                      Sent on {formatDate(pr.sentDate || pr.createdAt)} by {pr.sentBy || 'Staff'}
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
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#6E6466]">Loading candidate profile...</div>}>
      <ProfileDetailContent />
    </Suspense>
  );
}
