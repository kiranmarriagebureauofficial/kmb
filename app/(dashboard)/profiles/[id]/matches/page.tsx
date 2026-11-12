'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { store } from '@/lib/db/store';
import { Profile, MatchResult } from '@/lib/types';
import { MatchCard } from '@/components/matches/MatchCard';
import { ProposalModal } from '@/components/proposals/ProposalModal';
import { Button } from '@/components/ui/Button';
import { Sparkles, Star, Users, ArrowLeft, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

function ProfileMatchesContent() {
  const { tr } = useLanguage();
  const params = useParams();
  const id = params?.id as string;

  const [profile, setProfile] = useState<Profile | undefined>(undefined);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [activeTab, setActiveTab] = useState<'matches' | 'premium'>('premium');
  const [proposalPartner, setProposalPartner] = useState<Profile | null>(null);

  const loadData = () => {
    if (id) {
      const p = store.getProfileById(id);
      setProfile(p);
      const m = store.getMatchesForProfile(id);
      setMatches(m);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = store.subscribe(loadData);
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

  const premiumMatches = matches.filter(m => m.tier === 'premium');
  const regularMatches = matches.filter(m => m.tier === 'matches');

  const displayedList = activeTab === 'premium' ? premiumMatches : regularMatches;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5DFD5] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6E6466] mb-1">
            <Link href={`/profiles/${profile.id}`} className="hover:text-[#800F2F] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{tr('Back to', 'واپس')} {profile.name}</span>
            </Link>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#800F2F]">
            {tr('Compatibility Matches for', 'موزوں رشتے برائے')} {profile.name} ({profile.formNo})
          </h1>
          <p className="text-xs text-[#6E6466]">
            {profile.gender === 'Male' ? tr('Male', 'مرد') : tr('Female', 'خاتون')} • {profile.age} {tr('Yrs', 'سال')} • {profile.caste} • {profile.city} • {tr('Preferred Caste:', 'مطلوبہ ذات:')} {profile.preferences.castes.join(', ')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={loadData}
            icon={<RefreshCw className="w-3.5 h-3.5 text-[#800F2F]" />}
          >
            {tr('Re-run Match Engine', 'دوبارہ میچ تلاش کریں')}
          </Button>
        </div>
      </div>

      {/* Two Tabs: Matches (50 to 74%) & Premium (75%+) */}
      <div className="flex items-center gap-3 border-b border-[#E5DFD5] pb-1">
        <button
          onClick={() => setActiveTab('premium')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-serif text-sm font-bold tracking-wide transition-all border-t-2 border-x-2 ${
            activeTab === 'premium'
              ? 'bg-[#FFFFFF] text-[#B88B22] border-[#D4AF37] border-b-transparent shadow-sm'
              : 'text-[#6E6466] hover:text-[#800F2F] border-transparent'
          }`}
        >
          <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
          <span>{tr('Premium Rishtay (75%+)', 'پریمیم رشتے (75%+)')}</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-[#D4AF37] text-[#660A22] font-mono">
            {premiumMatches.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-serif text-sm font-bold tracking-wide transition-all border-t-2 border-x-2 ${
            activeTab === 'matches'
              ? 'bg-[#FFFFFF] text-[#800F2F] border-[#800F2F] border-b-transparent shadow-sm'
              : 'text-[#6E6466] hover:text-[#800F2F] border-transparent'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#800F2F]" />
          <span>{tr('Compatible Matches (50% - 74%)', 'موزوں رشتے (50% - 74%)')}</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-[#800F2F] text-[#F8F5F0] font-mono">
            {regularMatches.length}
          </span>
        </button>
      </div>

      {/* Match Cards List */}
      {displayedList.length === 0 ? (
        <div className="p-12 text-center bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl space-y-3">
          <Users className="w-10 h-10 text-[#D8D0C3] mx-auto" />
          <h3 className="font-serif text-base font-bold text-[#800F2F]">
            {activeTab === 'premium'
              ? tr('No Premium (75%+) Matches Found Yet', 'ابھی تک کوئی پریمیم (75%+) رشتہ نہیں ملا')
              : tr('No Compatible (50-74%) Matches Found Yet', 'ابھی تک کوئی معیاری (50-74%) رشتہ نہیں ملا')}
          </h3>
          <p className="text-xs text-[#6E6466] max-w-md mx-auto">
            {tr(
              'Profiles must satisfy hard filters (opposite gender, active status, religion, caste & sect preferences) before scoring. Check the other tab or adjust partner preferences.',
              'اسکورنگ سے قبل پروفائلز کا لازمی شرائط (مخالف جنس، فعال اسٹیٹس، مذہب، ذات اور مسلک) پر پورا اترنا ضروری ہے۔ دوسرا ٹیب چیک کریں یا ترجیحات میں لچک پیدا کریں۔'
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {displayedList.map(m => (
            <MatchCard
              key={m.id}
              match={m}
              sourceProfile={profile}
              onSendProposal={(partner) => setProposalPartner(partner)}
            />
          ))}
        </div>
      )}

      {/* Proposal Modal */}
      {proposalPartner && (
        <ProposalModal
          profileA={profile}
          profileB={proposalPartner}
          onClose={() => setProposalPartner(null)}
          onSuccess={() => alert(tr('Proposal logged successfully!', 'پروپوزل کامیابی سے درج کر لیا گیا!'))}
        />
      )}
    </div>
  );
}

export default function ProfileMatchesPage() {
  const { tr } = useLanguage();
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#6E6466]">{tr('Loading compatibility matches...', 'موزوں رشتے لوڈ ہو رہے ہیں...')}</div>}>
      <ProfileMatchesContent />
    </Suspense>
  );
}
