'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { store } from '@/lib/db/store';
import { Profile, MatchResult } from '@/lib/types';
import { formatPKR, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
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
import { useLanguage } from '@/lib/useLanguage';

function MatchesContent() {
  const { tr, isUr } = useLanguage();
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
    setProposalSentSuccess(
      tr(
        `Proposal registered for ${selectedProfile.name} & ${targetProfile.name}!`,
        `${selectedProfile.name} اور ${targetProfile.name} کے لیے پروپوزل درج کر لیا گیا!`
      )
    );
    setTimeout(() => setProposalSentSuccess(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-5 rounded-xl border border-[#E5DFD5] shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-serif font-bold tracking-widest text-[#B88B22]">
            {tr('Two-Way Algorithmic Matchmaking', 'دو طرفہ الگورتھمک میچ میکنگ')}
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#800F2F] mt-0.5">
            {tr('Match Central', 'میچ سینٹرل')}
          </h1>
          <p className="text-xs text-[#6E6466]">
            {tr(
              'Mutual compatibility scoring across Lahore inventory. Only scores 50%+ are shown.',
              'لاہور انوینٹری میں باہمی مطابقت سکورنگ۔ صرف 50%+ مطابقت والے رشتے دکھائے جاتے ہیں۔'
            )}
          </p>
        </div>

        {/* Profile Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#800F2F] shrink-0">{tr('Select Candidate:', 'امیدوار منتخب کریں:')}</span>
          <select
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#F8F5F0] border border-[#E5DFD5] text-xs font-semibold text-[#800F2F] focus:outline-none min-w-[220px]"
          >
            <option value="">{tr('-- Choose Candidate --', '-- امیدوار چنیں --')}</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>
                {p.formNo} - {p.name} ({p.gender === 'Male' ? tr('Male', 'مرد') : tr('Female', 'خاتون')}, {p.age}{tr('y', 'س')}, {p.caste})
              </option>
            ))}
          </select>
        </div>
      </div>

      {proposalSentSuccess && (
        <div className="p-3 bg-[#D4AF37]/20 text-[#800F2F] border border-[#D4AF37] rounded-xl flex items-center gap-2 text-xs font-bold">
          <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
          <span>{proposalSentSuccess}</span>
        </div>
      )}

      {/* Mode A: Selected Profile Matches */}
      {selectedProfile ? (
        <div className="space-y-4">
          {/* Candidate Summary Bar */}
          <div className="p-4 bg-[#800F2F] text-[#F8F5F0] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D4AF37]">
            <div className="flex items-center gap-3">
              <ProfileAvatar
                name={selectedProfile.name}
                photoUrl={selectedProfile.photoUrl}
                size="md"
                isPremium={Boolean(selectedProfile.isPremium || selectedProfile.premiumMember)}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg font-bold">
                    {selectedProfile.name}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#660A22] text-[#D4AF37] font-serif font-bold">
                    {selectedProfile.formNo}
                  </span>
                  {(selectedProfile.isPremium || selectedProfile.premiumMember) && (
                    <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                  )}
                </div>
                <p className="text-xs text-[#E5DFD5]">
                  {selectedProfile.gender === 'Male' ? tr('Male', 'مرد') : tr('Female', 'خاتون')} • {selectedProfile.age} {tr('yrs', 'سال')} • {selectedProfile.height} • {selectedProfile.caste} ({selectedProfile.maslak}) • {selectedProfile.city}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-end">
                <span className="text-[10px] text-[#E5DFD5] uppercase block font-semibold">{tr('Compatible Matches', 'موزوں رشتے')}</span>
                <span className="font-serif text-2xl font-bold text-[#D4AF37]">{profileMatches.length}</span>
              </div>
              <button
                onClick={() => setSelectedProfileId('')}
                className="px-3 py-1.5 rounded-lg bg-[#660A22] hover:bg-[#52061A] text-xs text-[#E5DFD5] border border-[#D4AF37]/30"
              >
                {tr('Clear', 'صاف کریں')}
              </button>
            </div>
          </div>

          {/* Filters for Matches */}
          <div className="flex items-center justify-between gap-4 flex-wrap bg-[#FFFFFF] p-3 rounded-xl border border-[#E5DFD5] text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#6E6466]">{tr('Filter Tier:', 'درجہ فلٹر:')}</span>
              <button
                onClick={() => setTierFilter('all')}
                className={`px-3 py-1 rounded-lg font-semibold ${tierFilter === 'all' ? 'bg-[#800F2F] text-[#F8F5F0]' : 'bg-[#F8F5F0] text-[#800F2F]'}`}
              >
                {tr('All (50%+)', 'تمام (50%+)')}
              </button>
              <button
                onClick={() => setTierFilter('premium')}
                className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 ${tierFilter === 'premium' ? 'bg-[#D4AF37] text-[#800F2F]' : 'bg-[#F8F5F0] text-[#800F2F]'}`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>{tr('Premium (75%+)', 'پریمیم (75%+)')}</span>
              </button>
              <button
                onClick={() => setTierFilter('standard')}
                className={`px-3 py-1 rounded-lg font-semibold ${tierFilter === 'standard' ? 'bg-[#800F2F] text-[#F8F5F0]' : 'bg-[#F8F5F0] text-[#800F2F]'}`}
              >
                {tr('Standard (50-74%)', 'معیاری (50-74%)')}
              </button>
            </div>

            <div className="text-[#6E6466] text-xs">
              {tr('Showing', 'ظاہر:')} <span className="font-bold text-[#800F2F]">{profileMatches.length}</span> {tr('compatible proposals', 'موزوں رشتے')}
            </div>
          </div>

          {/* Matches Grid */}
          {profileMatches.length === 0 ? (
            <div className="p-12 text-center bg-[#FFFFFF] rounded-xl border border-[#E5DFD5] space-y-2">
              <p className="font-serif text-lg font-bold text-[#800F2F]">{tr('No compatible matches found above 50%', '50% سے اوپر کوئی موزوں رشتہ نہیں ملا')}</p>
              <p className="text-xs text-[#6E6466]">
                {tr(
                  "Try adjusting partner preferences (e.g. age range, caste flexibility, or location) in the candidate's profile.",
                  'امیدوار کے پروفائل میں شریک حیات کی ترجیحات (جیسے عمر، ذات یا شہر) میں لچک پیدا کریں۔'
                )}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileMatches.map((m, idx) => {
                const partner = m.partnerProfile;
                const isPremiumTier = m.tier === 'premium';

                return (
                  <div
                    key={partner.id}
                    className="p-5 bg-[#FFFFFF] border border-[#E5DFD5] rounded-xl shadow-xs space-y-4 hover:border-[#D4AF37] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-[#800F2F] text-base">
                            {partner.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F8F5F0] font-bold text-[#6E6466] border border-[#E5DFD5]">
                            {partner.formNo}
                          </span>
                          {(partner.isPremium || partner.premiumMember) && (
                            <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                          )}
                        </div>
                        <p className="text-xs text-[#6E6466] mt-0.5">
                          {partner.age} {tr('yrs', 'سال')} • {partner.height} • {partner.caste} ({partner.maslak})
                        </p>
                        <p className="text-xs text-[#800F2F] font-medium mt-0.5">
                          {partner.profession} • {partner.city} • {formatPKR(partner.monthlyIncome || 0)}{tr('/mo', '/ماہ')}
                        </p>
                      </div>

                      {/* Match % Badge Ring */}
                      <div className="flex flex-col items-center">
                        <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 ${
                          isPremiumTier 
                            ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#800F2F]' 
                            : 'border-[#800F2F] bg-[#800F2F]/10 text-[#800F2F]'
                        }`}>
                          <span className="font-serif font-bold text-base leading-none">
                            {m.finalScore}%
                          </span>
                          <span className="text-[8px] uppercase font-bold tracking-wider text-[#6E6466]">
                            {tr('Match', 'میچ')}
                          </span>
                        </div>
                        {isPremiumTier && (
                          <span className="text-[9px] font-bold text-[#B88B22] uppercase mt-1 flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            {tr('Premium', 'پریمیم')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Criteria Breakdown */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 bg-[#F8F5F0] rounded-lg border border-[#E5DFD5]">
                      {m.breakdown.slice(0, 6).map((item, bIdx) => {
                        const scoreVal = item.scoreContribution ?? item.score ?? 0;
                        const labelText = isUr ? (item.labelUr || item.labelEn || item.criteria || item.key) : (item.labelEn || item.criteria || item.key);
                        return (
                          <div key={bIdx} className="flex items-center justify-between">
                            <span className="text-[#6E6466] truncate pe-1">{labelText}:</span>
                            <span className={`font-bold ${scoreVal >= item.maxScore * 0.75 ? 'text-[#800F2F]' : 'text-[#6E6466]'}`}>
                              {scoreVal}/{item.maxScore}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E5DFD5]">
                      <Link
                        href={`/profiles/${partner.id}`}
                        className="text-xs font-semibold text-[#800F2F] hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{tr('View Biodata', 'بائیوڈیٹا دیکھیں')}</span>
                      </Link>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="accent"
                          onClick={() => sendProposal(m, partner)}
                          icon={<HeartHandshake className="w-3.5 h-3.5 text-[#800F2F]" />}
                        >
                          {tr('Send Proposal', 'پروپوزل بھیجیں')}
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
          <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E5DFD5]">
            <h2 className="font-serif text-lg font-bold text-[#800F2F]">
              {tr('Bureau Recommended High-Compatibility Pairs (75%+)', 'بیورو کے تجویز کردہ بہترین جوڑے (75%+)')}
            </h2>
            <p className="text-xs text-[#6E6466]">
              {tr(
                'Algorithmic suggestions between active male and female rishtas in your current Lahore inventory.',
                'لاہور کی موجودہ انوینٹری میں فعال مرد اور خواتین رشتوں کے درمیان خودکار تجاویز۔'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bureauTopPairs.slice(0, 10).map((pair, idx) => (
              <div
                key={idx}
                className="p-5 bg-[#FFFFFF] border border-[#E5DFD5] rounded-xl shadow-xs space-y-4 hover:border-[#D4AF37] transition-colors"
              >
                {/* Score Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD5]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/20 text-[#800F2F] border border-[#D4AF37]">
                      ★ {tr('Premium Pair', 'پریمیم جوڑا')}
                    </span>
                    <span className="text-xs text-[#6E6466]">
                      {pair.profileA.caste} ↔ {pair.profileB.caste}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37] bg-[#D4AF37]/15 flex items-center justify-center font-serif font-bold text-sm text-[#800F2F]">
                    {pair.match.finalScore}%
                  </div>
                </div>

                {/* Candidate Side-by-Side Comparison */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#F8F5F0] rounded-lg border border-[#E5DFD5] space-y-1">
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase block">{tr('Groom', 'دولہا')}</span>
                    <p className="font-bold text-[#800F2F]">{pair.profileA.name}</p>
                    <p className="text-[11px] text-[#6E6466]">{pair.profileA.age}{tr('y', 'س')} • {pair.profileA.height}</p>
                    <p className="text-[11px] text-[#6E6466]">{pair.profileA.profession}</p>
                    <p className="text-[11px] text-[#800F2F] font-medium">{formatPKR(pair.profileA.monthlyIncome || 0)}</p>
                  </div>

                  <div className="p-3 bg-[#F8F5F0] rounded-lg border border-[#E5DFD5] space-y-1">
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase block">{tr('Bride', 'دلہن')}</span>
                    <p className="font-bold text-[#800F2F]">{pair.profileB.name}</p>
                    <p className="text-[11px] text-[#6E6466]">{pair.profileB.age}{tr('y', 'س')} • {pair.profileB.height}</p>
                    <p className="text-[11px] text-[#6E6466]">{pair.profileB.educationLevel}</p>
                    <p className="text-[11px] text-[#6E6466]">{pair.profileB.city}</p>
                  </div>
                </div>

                {/* Action button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#6E6466]">
                    {tr('Sect:', 'مسلک:')} {pair.profileA.maslak}
                  </span>
                  <Link
                    href={`/profiles/${pair.profileA.id}/matches`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#800F2F] text-[#F8F5F0] text-xs font-semibold hover:bg-[#660A22]"
                  >
                    <span>{tr('View Full Match Breakdown', 'مکمل میچ تفصیل دیکھیں')}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
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
  const { tr } = useLanguage();
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#6E6466]">{tr('Loading Match Central...', 'میچ سینٹرل لوڈ ہو رہا ہے...')}</div>}>
      <MatchesContent />
    </Suspense>
  );
}

