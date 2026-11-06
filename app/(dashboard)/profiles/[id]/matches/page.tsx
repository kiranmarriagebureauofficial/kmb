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

export default function ProfileMatchesPage() {
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
        <h2 className="font-serif text-xl font-bold text-[#5A0A14]">
          Profile Not Found
        </h2>
        <Link href="/profiles" className="text-xs font-semibold text-[#5A0A14] underline">
          Return to All Rishtas
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
      <div className="bg-[#FFFDF8] p-6 rounded-2xl border border-[#E9DDC3] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#7B5E5E] mb-1">
            <Link href={`/profiles/${profile.id}`} className="hover:text-[#5A0A14] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {profile.name}</span>
            </Link>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#5A0A14]">
            Compatibility Matches for {profile.name} ({profile.formNo})
          </h1>
          <p className="text-xs text-[#7B5E5E]">
            {profile.gender} • {profile.age} Yrs • {profile.caste} • {profile.city} • Preferred Caste: {profile.preferences.castes.join(', ')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={loadData}
            icon={<RefreshCw className="w-3.5 h-3.5 text-[#5A0A14]" />}
          >
            Re-run Match Engine
          </Button>
        </div>
      </div>

      {/* Two Tabs: Matches (50 to 74%) & Premium (75%+) */}
      <div className="flex items-center gap-3 border-b border-[#E9DDC3] pb-1">
        <button
          onClick={() => setActiveTab('premium')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-serif text-sm font-bold tracking-wide transition-all border-t-2 border-x-2 ${
            activeTab === 'premium'
              ? 'bg-[#FFFDF8] text-[#B08626] border-[#D9A93F] border-b-transparent shadow-sm'
              : 'text-[#7B5E5E] hover:text-[#5A0A14] border-transparent'
          }`}
        >
          <Star className="w-4 h-4 fill-[#D9A93F] text-[#D9A93F]" />
          <span>Premium Rishtay (75%+)</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-[#D9A93F] text-[#420610] font-mono">
            {premiumMatches.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-serif text-sm font-bold tracking-wide transition-all border-t-2 border-x-2 ${
            activeTab === 'matches'
              ? 'bg-[#FFFDF8] text-[#5A0A14] border-[#5A0A14] border-b-transparent shadow-sm'
              : 'text-[#7B5E5E] hover:text-[#5A0A14] border-transparent'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#5A0A14]" />
          <span>Compatible Matches (50% - 74%)</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-[#5A0A14] text-[#FBF4E6] font-mono">
            {regularMatches.length}
          </span>
        </button>
      </div>

      {/* Match Cards List */}
      {displayedList.length === 0 ? (
        <div className="p-12 text-center bg-[#FFFDF8] border border-[#E9DDC3] rounded-2xl space-y-3">
          <Users className="w-10 h-10 text-[#DECEAC] mx-auto" />
          <h3 className="font-serif text-base font-bold text-[#5A0A14]">
            No {activeTab === 'premium' ? 'Premium (75%+)' : 'Compatible (50-74%)'} Matches Found Yet
          </h3>
          <p className="text-xs text-[#7B5E5E] max-w-md mx-auto">
            Profiles must satisfy hard filters (opposite gender, active status, religion, caste & sect preferences) before scoring. Check the other tab or adjust partner preferences.
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
          onSuccess={() => alert('Proposal logged successfully!')}
        />
      )}
    </div>
  );
}
