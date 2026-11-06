'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { store } from '@/lib/db/store';
import { Profile, Proposal } from '@/lib/types';
import { formatPKR, formatDate, maskCNIC } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProfilePrintView } from '@/components/profiles/ProfilePrintView';
import { 
  Sparkles, 
  Printer, 
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

export default function ProfileDetailPage() {
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
        <h2 className="font-serif text-xl font-bold text-[#5A0A14]">
          Profile Not Found
        </h2>
        <Link href="/profiles" className="text-xs font-semibold text-[#5A0A14] underline">
          Return to All Rishtas
        </Link>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin';

  if (isPrintView) {
    return (
      <div className="space-y-4">
        <div className="no-print flex items-center justify-between bg-[#FFFDF8] p-4 rounded-xl border border-[#E9DDC3]">
          <button
            onClick={() => setIsPrintView(false)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#5A0A14]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Profile Details</span>
          </button>
          <span className="text-xs text-[#7B5E5E]">Print-Ready Official Layout</span>
        </div>
        <ProfilePrintView profile={profile} onClose={() => setIsPrintView(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#FFFDF8] p-6 rounded-2xl border border-[#E9DDC3] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-[#5A0A14] text-[#D9A93F] border-2 border-[#D9A93F] flex items-center justify-center font-serif font-bold text-2xl shrink-0 shadow-md">
            {profile.name.charAt(0)}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-serif text-2xl font-bold text-[#2A0A0F]">
                {profile.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-[#FBF4E6] text-[#5A0A14] border border-[#DECEAC]">
                {profile.formNo}
              </span>
              <Badge status={profile.status} />
              {profile.premiumMember && (
                <Badge variant="premium">Premium Member</Badge>
              )}
            </div>

            <p className="text-xs text-[#7B5E5E] flex items-center gap-2 flex-wrap">
              <span>{profile.gender}</span>
              <span>•</span>
              <span>{profile.age} Yrs ({profile.height})</span>
              <span>•</span>
              <span className="font-semibold text-[#5A0A14]">{profile.caste}</span>
              <span>•</span>
              <span>{profile.maslak}</span>
              <span>•</span>
              <span>{profile.maritalStatus}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/profiles/${profile.id}/matches`}>
            <Button size="sm" variant="primary" icon={<Sparkles className="w-3.5 h-3.5 text-[#D9A93F]" />}>
              View Matches
            </Button>
          </Link>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsPrintView(true)}
            icon={<Printer className="w-3.5 h-3.5 text-[#5A0A14]" />}
          >
            Print / PDF Form
          </Button>

          <Link href={`/profiles/${profile.id}/edit`}>
            <Button size="sm" variant="secondary" icon={<Edit className="w-3.5 h-3.5 text-[#5A0A14]" />}>
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
          <div className="bg-[#FFFDF8] rounded-2xl border border-[#E9DDC3] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E9DDC3] pb-3">
              <h3 className="font-serif text-base font-bold text-[#5A0A14]">
                1. Personal & Family Lineage
              </h3>
              <span className="text-xs font-urdu text-[#7B5E5E]">ذاتی و خاندانی پس منظر</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#7B5E5E] block">Father Name:</span>
                <span className="font-semibold text-[#2A0A0F]">{profile.fatherName}</span>
                <span className="text-[11px] text-[#7B5E5E] block">({profile.fatherOccupation})</span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block">Mother Name:</span>
                <span className="font-semibold text-[#2A0A0F]">{profile.motherName}</span>
                <span className="text-[11px] text-[#7B5E5E] block">({profile.motherOccupation || 'Homemaker'})</span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block">Siblings:</span>
                <span className="font-semibold text-[#2A0A0F]">Total {profile.totalSiblings}</span>
                <span className="text-[11px] text-[#7B5E5E] block">
                  {profile.brothersCount} Bros, {profile.sistersCount} Sis ({profile.marriedSiblingsCount} Married)
                </span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block">Caste / Qaum:</span>
                <span className="font-bold text-[#5A0A14]">{profile.caste}</span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block">Maslak / Sect:</span>
                <span className="font-semibold text-[#2A0A0F]">{profile.maslak}</span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block">Religion:</span>
                <span className="font-semibold text-[#2A0A0F]">{profile.religion}</span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block">City & Area:</span>
                <span className="font-semibold text-[#2A0A0F]">{profile.city}</span>
                <span className="text-[11px] text-[#7B5E5E] block">{profile.societyName || 'Lahore'}</span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block">Date Applied:</span>
                <span className="font-semibold text-[#2A0A0F]">{formatDate(profile.dateApplied)}</span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block">Applied / Brought By:</span>
                <span className="font-semibold text-[#2A0A0F]">{profile.appliedBy}</span>
              </div>
            </div>
          </div>

          {/* 2. Educational & Career Profile */}
          <div className="bg-[#FFFDF8] rounded-2xl border border-[#E9DDC3] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E9DDC3] pb-3">
              <h3 className="font-serif text-base font-bold text-[#5A0A14]">
                2. Educational & Professional Standing
              </h3>
              <span className="text-xs font-urdu text-[#7B5E5E]">تعلیمی و پیشہ ورانہ کوائف</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <span className="text-[#7B5E5E] block">Degree & Institute:</span>
                <span className="font-bold text-[#2A0A0F] text-sm">{profile.degree}</span>
                <span className="text-[11px] text-[#5A0A14] font-medium block">{profile.educationLevel}</span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block">Monthly Income:</span>
                <span className="font-bold text-[#5A0A14] text-sm">{formatPKR(profile.monthlyIncome)}</span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block">Profession:</span>
                <span className="font-semibold text-[#2A0A0F]">{profile.profession}</span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block">Designation:</span>
                <span className="font-semibold text-[#2A0A0F]">{profile.designation || 'N/A'}</span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block">Experience:</span>
                <span className="font-semibold text-[#2A0A0F]">
                  {profile.experienceYears ? `${profile.experienceYears} Years` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Partner Preferences */}
          <div className="bg-[#FFFDF8] rounded-2xl border border-[#E9DDC3] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E9DDC3] pb-3">
              <h3 className="font-serif text-base font-bold text-[#5A0A14]">
                3. Partner Preferences (Configured for Matching Engine)
              </h3>
              <span className="text-xs font-urdu text-[#7B5E5E]">شریک حیات کی ترجیحات</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[#7B5E5E] block">Preferred Age Range:</span>
                <span className="font-bold text-[#2A0A0F]">{profile.preferences.ageMin} – {profile.preferences.ageMax} Years</span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block">Minimum Education:</span>
                <span className="font-semibold text-[#2A0A0F]">{profile.preferences.educationMin}</span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block">Acceptable Castes:</span>
                <span className="font-semibold text-[#5A0A14]">{profile.preferences.castes.join(', ')}</span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block">Preferred Cities:</span>
                <span className="font-semibold text-[#2A0A0F]">{profile.preferences.cities.join(', ')}</span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block">Preferred Maslak:</span>
                <span className="font-semibold text-[#2A0A0F]">{profile.preferences.maslak}</span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block">Marital Statuses:</span>
                <span className="font-semibold text-[#2A0A0F]">{profile.preferences.maritalStatuses.join(', ')}</span>
              </div>

              <div className="col-span-full pt-1">
                <span className="text-[#7B5E5E] block">Other Expectations / Notes:</span>
                <p className="text-xs text-[#2A0A0F] italic bg-[#FBF4E6] p-2.5 rounded-lg border border-[#E9DDC3] mt-1">
                  {profile.preferences.otherNotes || 'Respectable family background and cultural alignment.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Confidential Contact & Internal Remarks */}
        <div className="lg:col-span-4 space-y-6">
          {/* Confidential Contact Box (Staff Only) */}
          <div className="bg-[#FFFDF8] rounded-2xl border-2 border-[#5A0A14] p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-[#E9DDC3] pb-2 text-[#5A0A14]">
              <ShieldCheck className="w-4 h-4 text-[#D9A93F]" />
              <h3 className="font-serif font-bold text-xs uppercase tracking-wider">
                Confidential Contact (Staff Only)
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[#7B5E5E] block text-[10px] uppercase font-bold">Primary Phone</span>
                <span className="font-bold text-[#5A0A14] text-sm">{profile.phone}</span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block text-[10px] uppercase font-bold">WhatsApp</span>
                <span className="font-semibold text-[#2A0A0F]">{profile.whatsapp}</span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block text-[10px] uppercase font-bold">Guardian</span>
                <span className="font-semibold text-[#2A0A0F]">
                  {profile.guardianName || 'N/A'} ({profile.guardianPhone || 'N/A'})
                </span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block text-[10px] uppercase font-bold">Home Address</span>
                <span className="text-[#2A0A0F]">{profile.address}</span>
              </div>

              <div>
                <span className="text-[#7B5E5E] block text-[10px] uppercase font-bold">CNIC</span>
                <span className="font-mono text-[#2A0A0F]">
                  {isAdmin ? profile.cnic || 'N/A' : maskCNIC(profile.cnic)}
                </span>
              </div>
            </div>
          </div>

          {/* Internal Remarks */}
          <div className="bg-[#420610] text-[#FBF4E6] rounded-2xl p-5 shadow-sm space-y-2 border border-[#D9A93F]/40">
            <span className="text-[10px] uppercase font-bold text-[#D9A93F] tracking-wider block">
              Internal Office Remarks (Never Shared)
            </span>
            <p className="text-xs text-[#E9DDC3] leading-relaxed italic">
              {profile.remarks || 'No internal remarks logged.'}
            </p>
          </div>

          {/* Associated Proposals History */}
          <div className="bg-[#FFFDF8] rounded-2xl border border-[#E9DDC3] p-5 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 border-b border-[#E9DDC3] pb-2 text-[#5A0A14]">
              <HeartHandshake className="w-4 h-4 text-[#D9A93F]" />
              <h3 className="font-serif font-bold text-xs uppercase tracking-wider">
                Proposal Pipeline History
              </h3>
            </div>

            {proposals.length === 0 ? (
              <p className="text-[11px] text-[#7B5E5E]">No active proposals logged yet for this candidate.</p>
            ) : (
              <div className="space-y-2">
                {proposals.map(pr => (
                  <div key={pr.id} className="p-2.5 rounded-lg bg-[#FBF4E6] border border-[#E9DDC3] space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#5A0A14] truncate max-w-[150px]">
                        {pr.profileAId === profile.id ? pr.profileBName : pr.profileAName}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-[#D9A93F] bg-[#5A0A14] px-1.5 py-0.5 rounded">
                        {pr.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#7B5E5E]">
                      Sent on {formatDate(pr.sentDate)} by {pr.sentBy}
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
