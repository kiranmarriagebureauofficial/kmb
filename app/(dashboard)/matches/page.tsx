'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { store } from '@/lib/db/store';
import { Profile, MatchResult } from '@/lib/types';
import { formatPKR, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Sparkles, 
  Star, 
  Search, 
  HeartHandshake, 
  Share2, 
  ChevronRight, 
  CheckCircle, 
  SlidersHorizontal,
  UserCheck,
  Send,
  Eye,
  Filter
} from 'lucide-react';

function MatchesContent() {
  const searchParams = useSearchParams();
  const initialProfileId = searchParams.get('profileId') || '';

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>(initialProfileId);
  const [tierFilter, setTierFilter] = useState<'all' | 'premium' | 'standard'>('all');
  const [minScore, setMinScore] = useState<number>(50);
  const [proposalSentSuccess, setProposalSentSuccess] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setProfiles(store.getActiveProfiles());
    };
    update();
    const unsub = store.subscribe(update);
    return unsub;
  }, []);

  // Selected profile
  const selectedProfile = useMemo(() => {
    if (!selectedProfileId) return null;
    return profiles.find(p => p.id === selectedProfileId) || null;
  }, [profiles, selectedProfileId]);

  // Matches for selected profile
  const profileMatches = useMemo(() => {
    if (!selectedProfile) return [];
    return store.getMatchesForProfile(selectedProfile.id).filter(m => {
      if (m.finalScore < minScore) return false;
      if (tierFilter === 'premium' && m.tier !== 'premium') return false;
      if (tierFilter === 'standard' && m.tier !== 'standard') return false;
      return true;
    });
  }, [selectedProfile, tierFilter, minScore]);

  // Bureau-wide premium match pairs
  const bureauTopPairs = useMemo(() => {
    return store.getAllPremiumMatches();
  }, [profiles]);

  const sendProposal = (match: MatchResult, targetProfile: Profile) => {
    if (!selectedProfile) return;
    const prop = store.addProposal({
      profileAId: selectedProfile.id,
      profileAName: `${selectedProfile.name} (${selectedProfile.formNo})`,
      profileBId: targetProfile.id,
      profileBName: `${targetProfile.name} (${targetProfile.formNo})`,
      matchScore: match.finalScore,
      status: 'sent',
      notes: `Direct proposal initiated via Match Central. Match Compatibility: ${match.finalScore}%.`,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          date: new Date().toISOString(),
          actor: store.getCurrentUser()?.name || 'Staff',
          action: 'Proposal Sent',
          notes: 'Biodata & compatibility summary sent to family.',
        }
      ]
    });
    setProposalSentSuccess(`Proposal registered for ${selectedProfile.name} & ${targetProfile.name}!`);
    setTimeout(() => setProposalSentSuccess(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDF8] p-5 rounded-xl border border-[#E9DDC3] shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-serif font-bold tracking-widest text-[#B08626]">
            Two-Way Algorithmic Matchmaking
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#5A0A14] mt-0.5">
            Match Central
          </h1>
          <p className="text-xs text-[#7B5E5E]">
            Mutual compatibility scoring across Lahore inventory. Only scores 50%+ are shown.
          </p>
        </div>

        {/* Profile Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#5A0A14] shrink-0">Select Candidate:</span>
          <select
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#FBF4E6] border border-[#E9DDC3] text-xs font-semibold text-[#5A0A14] focus:outline-none min-w-[220px]"
          >
            <option value="">-- Choose Candidate --</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>
                {p.formNo} - {p.name} ({p.gender}, {p.age}y, {p.caste})
              </option>
            ))}
          </select>
        </div>
      </div>

      {proposalSentSuccess && (
        <div className="p-3 bg-[#D9A93F]/20 text-[#5A0A14] border border-[#D9A93F] rounded-xl flex items-center gap-2 text-xs font-bold">
          <CheckCircle className="w-4 h-4 text-[#D9A93F]" />
          <span>{proposalSentSuccess}</span>
        </div>
      )}

      {/* Mode A: Selected Profile Matches */}
      {selectedProfile ? (
        <div className="space-y-4">
          {/* Candidate Summary Bar */}
          <div className="p-4 bg-[#5A0A14] text-[#FBF4E6] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9A93F]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#420610] text-[#D9A93F] font-serif font-bold text-base flex items-center justify-center border border-[#D9A93F]/50">
                {selectedProfile.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg font-bold">
                    {selectedProfile.name}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#420610] text-[#D9A93F] font-serif font-bold">
                    {selectedProfile.formNo}
                  </span>
                  {(selectedProfile.isPremium || selectedProfile.premiumMember) && (
                    <Star className="w-3.5 h-3.5 fill-[#D9A93F] text-[#D9A93F]" />
                  )}
                </div>
                <p className="text-xs text-[#E9DDC3]">
                  {selectedProfile.gender} • {selectedProfile.age} yrs • {selectedProfile.height} • {selectedProfile.caste} ({selectedProfile.maslak}) • {selectedProfile.city}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-[#E9DDC3] uppercase block font-semibold">Compatible Matches</span>
                <span className="font-serif text-2xl font-bold text-[#D9A93F]">{profileMatches.length}</span>
              </div>
              <button
                onClick={() => setSelectedProfileId('')}
                className="px-3 py-1.5 rounded-lg bg-[#420610] hover:bg-[#32040B] text-xs text-[#E9DDC3] border border-[#D9A93F]/30"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Filters for Matches */}
          <div className="flex items-center justify-between gap-4 flex-wrap bg-[#FFFDF8] p-3 rounded-xl border border-[#E9DDC3] text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#7B5E5E]">Filter Tier:</span>
              <button
                onClick={() => setTierFilter('all')}
                className={`px-3 py-1 rounded-lg font-semibold ${tierFilter === 'all' ? 'bg-[#5A0A14] text-[#FBF4E6]' : 'bg-[#FBF4E6] text-[#5A0A14]'}`}
              >
                All (50%+)
              </button>
              <button
                onClick={() => setTierFilter('premium')}
                className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 ${tierFilter === 'premium' ? 'bg-[#D9A93F] text-[#5A0A14]' : 'bg-[#FBF4E6] text-[#5A0A14]'}`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>Premium (75%+)</span>
              </button>
              <button
                onClick={() => setTierFilter('standard')}
                className={`px-3 py-1 rounded-lg font-semibold ${tierFilter === 'standard' ? 'bg-[#5A0A14] text-[#FBF4E6]' : 'bg-[#FBF4E6] text-[#5A0A14]'}`}
              >
                Standard (50-74%)
              </button>
            </div>

            <div className="text-[#7B5E5E] text-xs">
              Showing <span className="font-bold text-[#5A0A14]">{profileMatches.length}</span> compatible proposals
            </div>
          </div>

          {/* Matches Grid */}
          {profileMatches.length === 0 ? (
            <div className="p-12 text-center bg-[#FFFDF8] rounded-xl border border-[#E9DDC3] space-y-2">
              <p className="font-serif text-lg font-bold text-[#5A0A14]">No compatible matches found above 50%</p>
              <p className="text-xs text-[#7B5E5E]">Try adjusting partner preferences (e.g. age range, caste flexibility, or location) in the candidate's profile.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileMatches.map((m, idx) => {
                const partner = m.partnerProfile;
                const isPremiumTier = m.tier === 'premium';

                return (
                  <div
                    key={partner.id}
                    className="p-5 bg-[#FFFDF8] border border-[#E9DDC3] rounded-xl shadow-xs space-y-4 hover:border-[#D9A93F] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-[#5A0A14] text-base">
                            {partner.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FBF4E6] font-bold text-[#7B5E5E] border border-[#E9DDC3]">
                            {partner.formNo}
                          </span>
                          {(partner.isPremium || partner.premiumMember) && (
                            <Star className="w-3 h-3 fill-[#D9A93F] text-[#D9A93F]" />
                          )}
                        </div>
                        <p className="text-xs text-[#7B5E5E] mt-0.5">
                          {partner.age} yrs • {partner.height} • {partner.caste} ({partner.maslak})
                        </p>
                        <p className="text-xs text-[#5A0A14] font-medium mt-0.5">
                          {partner.profession} • {partner.city} • {formatPKR(partner.monthlyIncome || 0)}/mo
                        </p>
                      </div>

                      {/* Match % Badge Ring */}
                      <div className="flex flex-col items-center">
                        <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 ${
                          isPremiumTier 
                            ? 'border-[#D9A93F] bg-[#D9A93F]/15 text-[#5A0A14]' 
                            : 'border-[#5A0A14] bg-[#5A0A14]/10 text-[#5A0A14]'
                        }`}>
                          <span className="font-serif font-bold text-base leading-none">
                            {m.finalScore}%
                          </span>
                          <span className="text-[8px] uppercase font-bold tracking-wider text-[#7B5E5E]">
                            Match
                          </span>
                        </div>
                        {isPremiumTier && (
                          <span className="text-[9px] font-bold text-[#B08626] uppercase mt-1 flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            Premium
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Criteria Breakdown */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 bg-[#FBF4E6] rounded-lg border border-[#E9DDC3]">
                      {m.breakdown.slice(0, 6).map((item, bIdx) => {
                        const scoreVal = item.scoreContribution ?? item.score ?? 0;
                        const labelText = item.labelEn || item.criteria || item.key;
                        return (
                          <div key={bIdx} className="flex items-center justify-between">
                            <span className="text-[#7B5E5E] truncate pr-1">{labelText}:</span>
                            <span className={`font-bold ${scoreVal >= item.maxScore * 0.75 ? 'text-[#5A0A14]' : 'text-[#7B5E5E]'}`}>
                              {scoreVal}/{item.maxScore}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E9DDC3]">
                      <Link
                        href={`/profiles/${partner.id}`}
                        className="text-xs font-semibold text-[#5A0A14] hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Biodata</span>
                      </Link>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="accent"
                          onClick={() => sendProposal(m, partner)}
                          icon={<HeartHandshake className="w-3.5 h-3.5 text-[#5A0A14]" />}
                        >
                          Send Proposal
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Mode B: Bureau-Wide Suggested Pairings */
        <div className="space-y-4">
          <div className="p-4 bg-[#FFFDF8] rounded-xl border border-[#E9DDC3]">
            <h2 className="font-serif text-lg font-bold text-[#5A0A14]">
              Bureau Recommended High-Compatibility Pairs (75%+)
            </h2>
            <p className="text-xs text-[#7B5E5E]">
              Algorithmic suggestions between active male and female rishtas in your current Lahore inventory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bureauTopPairs.slice(0, 10).map((pair, idx) => (
              <div
                key={idx}
                className="p-5 bg-[#FFFDF8] border border-[#E9DDC3] rounded-xl shadow-xs space-y-4 hover:border-[#D9A93F] transition-colors"
              >
                {/* Score Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E9DDC3]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D9A93F]/20 text-[#5A0A14] border border-[#D9A93F]">
                      ★ Premium Pair
                    </span>
                    <span className="text-xs text-[#7B5E5E]">
                      {pair.profileA.caste} ↔ {pair.profileB.caste}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-full border-2 border-[#D9A93F] bg-[#D9A93F]/15 flex items-center justify-center font-serif font-bold text-sm text-[#5A0A14]">
                    {pair.match.finalScore}%
                  </div>
                </div>

                {/* Candidate Side-by-Side Comparison */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#FBF4E6] rounded-lg border border-[#E9DDC3] space-y-1">
                    <span className="text-[10px] font-bold text-[#D9A93F] uppercase block">Groom</span>
                    <p className="font-bold text-[#5A0A14]">{pair.profileA.name}</p>
                    <p className="text-[11px] text-[#7B5E5E]">{pair.profileA.age}y • {pair.profileA.height}</p>
                    <p className="text-[11px] text-[#7B5E5E]">{pair.profileA.profession}</p>
                    <p className="text-[11px] text-[#5A0A14] font-medium">{formatPKR(pair.profileA.monthlyIncome || 0)}</p>
                  </div>

                  <div className="p-3 bg-[#FBF4E6] rounded-lg border border-[#E9DDC3] space-y-1">
                    <span className="text-[10px] font-bold text-[#D9A93F] uppercase block">Bride</span>
                    <p className="font-bold text-[#5A0A14]">{pair.profileB.name}</p>
                    <p className="text-[11px] text-[#7B5E5E]">{pair.profileB.age}y • {pair.profileB.height}</p>
                    <p className="text-[11px] text-[#7B5E5E]">{pair.profileB.educationLevel}</p>
                    <p className="text-[11px] text-[#7B5E5E]">{pair.profileB.city}</p>
                  </div>
                </div>

                {/* Action button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#7B5E5E]">
                    Sect: {pair.profileA.maslak}
                  </span>
                  <Link
                    href={`/profiles/${pair.profileA.id}/matches`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5A0A14] text-[#FBF4E6] text-xs font-semibold hover:bg-[#420610]"
                  >
                    <span>View Full Match Breakdown</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#D9A93F]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MatchesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#7B5E5E]">Loading Match Central...</div>}>
      <MatchesContent />
    </Suspense>
  );
}

