'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { store } from '@/lib/db/store';
import { Profile, MatchResult } from '@/lib/types';
import { MatchRing } from '@/components/ui/MatchRing';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProposalModal } from '@/components/proposals/ProposalModal';
import { ProfileComparisonModal } from '@/components/matches/ProfileComparisonModal';
import { buildWhatsAppShareSummary, generateWhatsAppLink } from '@/lib/utils';
import { 
  Star, 
  Sparkles, 
  Filter, 
  MapPin, 
  Share2, 
  ArrowLeftRight, 
  HeartHandshake, 
  Eye, 
  Crown,
  CalendarCheck
} from 'lucide-react';
import { COMMON_CITIES } from '@/lib/i18n';
import { useLanguage } from '@/lib/useLanguage';

export default function PremiumRishtayDirectoryPage() {
  const { tr } = useLanguage();
  const [pairs, setPairs] = useState<{ profileA: Profile; profileB: Profile; match: MatchResult }[]>([]);
  const [filterCity, setFilterCity] = useState<string>('All');
  const [filterPremiumMemberOnly, setFilterPremiumMemberOnly] = useState<boolean>(false);
  const [activeComparison, setActiveComparison] = useState<{ a: Profile; b: Profile; m: MatchResult } | null>(null);
  const [activeProposal, setActiveProposal] = useState<{ a: Profile; b: Profile } | null>(null);

  const settings = store.getSettings();

  useEffect(() => {
    const update = () => {
      setPairs(store.getAllPremiumMatches());
    };
    update();
    const unsub = store.subscribe(update);
    return unsub;
  }, []);

  const filteredPairs = useMemo(() => {
    return pairs.filter(p => {
      if (filterCity !== 'All') {
        const cityMatch =
          p.profileA.city.toLowerCase() === filterCity.toLowerCase() ||
          p.profileB.city.toLowerCase() === filterCity.toLowerCase();
        if (!cityMatch) return false;
      }
      if (filterPremiumMemberOnly) {
        const isAPremium = p.profileA.isPremium || p.profileA.premiumMember;
        const isBPremium = p.profileB.isPremium || p.profileB.premiumMember;
        if (!isAPremium && !isBPremium) return false;
      }
      return true;
    });
  }, [pairs, filterCity, filterPremiumMemberOnly]);

  const handleShareSummary = (partner: Profile) => {
    const summary = buildWhatsAppShareSummary(partner, {
      name: settings.bureauName,
      phone: settings.whatsapp,
    });
    const waUrl = generateWhatsAppLink('', summary);
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border-2 border-[#D4AF37] p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D4AF37] text-[#660A22]">
            <Crown className="w-3.5 h-3.5 fill-[#660A22]" />
            <span>{tr('Bureau-Wide 75%+ Compatibility Directory', 'بیورو بھر کی 75% سے زائد مطابقت والی فہرست')}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#800F2F]">
            {tr(`Premium Rishtay Pairs (${filteredPairs.length})`, `پریمیم رشتوں کے جوڑے (${filteredPairs.length})`)}
          </h1>
          <p className="text-xs text-[#6E6466]">
            {tr(
              'All verified male & female profiles across Lahore & Pakistan achieving 75%+ two-way compatibility.',
              'لاہور اور پاکستان بھر کے تمام تصدیق شدہ مرد و خواتین پروفائلز جن کی باہمی مطابقت 75% یا اس سے زیادہ ہے۔'
            )}
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div>
            <label className="block text-[10px] uppercase font-bold text-[#6E6466] mb-1">{tr('Location', 'مقام')}</label>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
            >
              <option value="All">{tr('All Cities', 'تمام شہر')}</option>
              {COMMON_CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-[#800F2F]">
              <input
                type="checkbox"
                checked={filterPremiumMemberOnly}
                onChange={(e) => setFilterPremiumMemberOnly(e.target.checked)}
                className="w-4 h-4 text-[#D4AF37] rounded border-[#E5DFD5]"
              />
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                <span>{tr('VIP Clients Only', 'صرف وی آئی پی کلائنٹس')}</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Pairs List */}
      {filteredPairs.length === 0 ? (
        <div className="p-12 text-center bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl space-y-3">
          <Star className="w-10 h-10 text-[#D4AF37] mx-auto fill-[#D4AF37]" />
          <h3 className="font-serif text-base font-bold text-[#800F2F]">
            {tr('No 75%+ Premium Match Pairs Found with Selected Filters', 'منتخب فلٹرز کے مطابق کوئی 75%+ پریمیم جوڑا نہیں ملا')}
          </h3>
          <p className="text-xs text-[#6E6466]">
            {tr('Try changing the city filter to "All Cities" or register new compatible profiles.', 'شہر کا فلٹر "تمام شہر" پر تبدیل کریں یا نئے موزوں پروفائلز شامل کریں۔')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPairs.map(({ profileA, profileB, match }) => (
            <div
              key={match.id}
              className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border-s-4 border-s-[#D4AF37] grid grid-cols-1 lg:grid-cols-12 gap-4 items-center"
            >
              {/* Groom Party A */}
              <div className="lg:col-span-4 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm text-[#2C2526]">
                    {profileA.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#6E6466] bg-[#F8F5F0] px-1 py-0.5 rounded">
                    {profileA.formNo}
                  </span>
                  {profileA.premiumMember && (
                    <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                  )}
                </div>
                <p className="text-xs text-[#6E6466]">
                  {profileA.age} {tr('Yrs', 'سال')} • {profileA.height} • <strong className="text-[#800F2F]">{profileA.caste}</strong> • {profileA.maslak}
                </p>
                <p className="text-xs text-[#2C2526] truncate">{profileA.profession} ({profileA.degree})</p>
                <p className="text-[11px] text-[#6E6466] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#D4AF37]" />
                  <span>{profileA.city} ({profileA.societyName || tr('Lahore', 'لاہور')})</span>
                </p>
              </div>

              {/* Match Score & Compatibility Badge */}
              <div className="lg:col-span-3 flex flex-col items-center justify-center text-center p-3 bg-[#F8F5F0] rounded-xl border border-[#D4AF37]/40 space-y-1">
                <MatchRing score={match.finalScore} size={54} strokeWidth={5} />
                <Badge tier="premium" className="text-[10px]" />
                <span className="text-[10px] text-[#6E6466]" dir="ltr">
                  A: {match.scoreAB}% ↔ B: {match.scoreBA}%
                </span>
              </div>

              {/* Bride Party B */}
              <div className="lg:col-span-3 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm text-[#2C2526]">
                    {profileB.name}
                  </span>
                  <span className="text-[10px] font-mono text-[#6E6466] bg-[#F8F5F0] px-1 py-0.5 rounded">
                    {profileB.formNo}
                  </span>
                  {profileB.premiumMember && (
                    <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                  )}
                </div>
                <p className="text-xs text-[#6E6466]">
                  {profileB.age} {tr('Yrs', 'سال')} • {profileB.height} • <strong className="text-[#800F2F]">{profileB.caste}</strong> • {profileB.maslak}
                </p>
                <p className="text-xs text-[#2C2526] truncate">{profileB.profession} ({profileB.degree})</p>
                <p className="text-[11px] text-[#6E6466] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#D4AF37]" />
                  <span>{profileB.city} ({profileB.societyName || tr('Lahore', 'لاہور')})</span>
                </p>
              </div>

              {/* Actions Column */}
              <div className="lg:col-span-2 flex flex-col sm:flex-row lg:flex-col gap-2 justify-end">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setActiveProposal({ a: profileA, b: profileB })}
                  icon={<HeartHandshake className="w-3.5 h-3.5 text-[#D4AF37]" />}
                >
                  {tr('Initiate Proposal', 'پروپوزل بھیجیں')}
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setActiveComparison({ a: profileA, b: profileB, m: match })}
                  icon={<ArrowLeftRight className="w-3.5 h-3.5 text-[#800F2F]" />}
                >
                  {tr('Compare', 'موازنہ کریں')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comparison Modal */}
      {activeComparison && (
        <ProfileComparisonModal
          profileA={activeComparison.a}
          profileB={activeComparison.b}
          match={activeComparison.m}
          onClose={() => setActiveComparison(null)}
        />
      )}

      {/* Proposal Modal */}
      {activeProposal && (
        <ProposalModal
          profileA={activeProposal.a}
          profileB={activeProposal.b}
          onClose={() => setActiveProposal(null)}
          onSuccess={() => alert(tr('Proposal created and tracked!', 'پروپوزل بنا کر ریکارڈ کر لیا گیا!'))}
        />
      )}
    </div>
  );
}

