'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MatchResult, Profile } from '@/lib/types';
import { store } from '@/lib/db/store';
import { MatchRing } from '../ui/MatchRing';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ProfileAvatar } from '../ui/ProfileAvatar';
import { buildWhatsAppShareSummary, generateWhatsAppLink } from '@/lib/utils';
import { 
  Check, 
  X, 
  Share2, 
  HeartHandshake, 
  ArrowLeftRight, 
  Star, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ProfileComparisonModal } from './ProfileComparisonModal';
import { useLanguage } from '@/lib/useLanguage';

interface MatchCardProps {
  match: MatchResult;
  sourceProfile: Profile;
  onSendProposal?: (partnerProfile: Profile) => void;
}

export function MatchCard({ match, sourceProfile, onSendProposal }: MatchCardProps) {
  const { tr, isUr } = useLanguage();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const partner = match.partnerProfile;
  const settings = store.getSettings();

  const handleShareWhatsApp = () => {
    const summary = buildWhatsAppShareSummary(partner, {
      name: settings.bureauName,
      phone: settings.whatsapp,
    });
    const waUrl = generateWhatsAppLink('', summary);
    window.open(waUrl, '_blank');
  };

  return (
    <>
      <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden border-s-4 hover:border-s-[#D4AF37] flex flex-col justify-between">
        <div className="p-5 space-y-4">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {/* Avatar / Photo */}
              <ProfileAvatar
                name={partner.name}
                photoUrl={partner.photoUrl}
                size="md"
                isPremium={Boolean(partner.premiumMember)}
                className="shadow-sm"
              />

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif text-base font-bold text-[#2C2526]">
                    {partner.name}
                  </h3>
                  <span className="text-xs font-mono font-semibold text-[#800F2F] bg-[#F8F5F0] px-1.5 py-0.5 rounded border border-[#E5DFD5]">
                    {tr('Reg:', 'رجسٹر:')} {partner.formNo}
                  </span>
                  {partner.premiumMember && (
                    <Badge variant="premium">{tr('Premium Member', 'پریمیم ممبر')}</Badge>
                  )}
                </div>

                <p className="text-xs text-[#6E6466] mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>{partner.age} {tr('Yrs', 'سال')}</span>
                  <span>•</span>
                  <span>{partner.height}</span>
                  <span>•</span>
                  <span className="font-semibold text-[#800F2F]">{partner.caste}</span>
                  <span>•</span>
                  <span>{partner.maslak}</span>
                </p>
              </div>
            </div>

            {/* Circular Match Ring */}
            <div className="shrink-0 flex flex-col items-center">
              <MatchRing score={match.finalScore} size={58} strokeWidth={5} />
              <Badge
                tier={match.tier}
                className="mt-1 text-[10px] py-0 px-1.5"
              >
                {match.tier === 'premium' ? tr('75%+ Premium', '75%+ پریمیم') : tr('Compatible', 'موزوں')}
              </Badge>
            </div>
          </div>

          {/* Quick Details Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#F8F5F0] border border-[#E5DFD5]">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="truncate">{partner.city} ({partner.societyName || tr('Lahore', 'لاہور')})</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#F8F5F0] border border-[#E5DFD5]">
              <GraduationCap className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="truncate">{partner.degree}</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#F8F5F0] border border-[#E5DFD5]">
              <Briefcase className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="truncate">{partner.profession}</span>
            </div>
          </div>

          {/* Two-Way Scoring Metrics */}
          <div className="p-3 bg-[#F8F5F0] rounded-xl border border-[#E5DFD5] flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#6E6466] block">
                {tr('Two-Way Compatibility', 'دو طرفہ مطابقت')}
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span>
                  {tr('Candidate Suitability:', 'امیدوار کی مطابقت:')} <strong className="text-[#800F2F]">{match.scoreAB}%</strong>
                </span>
                <span className="text-[#D8D0C3]">|</span>
                <span>
                  {tr('Partner Suitability:', 'فریقِ ثانی کی مطابقت:')} <strong className="text-[#800F2F]">{match.scoreBA}%</strong>
                </span>
              </div>
            </div>

            {match.mutual && (
              <span className="px-2 py-1 rounded bg-[#D4AF37]/20 text-[#800F2F] border border-[#D4AF37] text-[11px] font-bold">
                ✓ {tr('High Mutual Fit', 'بہترین باہمی جوڑ')}
              </span>
            )}
          </div>

          {/* Collapsible Compatibility Breakdown (Gold checks, maroon crosses) */}
          <div>
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-xs font-semibold text-[#800F2F] hover:text-[#96163A] flex items-center gap-1.5 transition-colors"
            >
              <span>
                {showBreakdown
                  ? tr('Hide Compatibility Factors', 'مطابقت کی تفصیل چھپائیں')
                  : tr('View Compatibility Factors & Match Analysis', 'مطابقت کے عوامل اور تجزیہ دیکھیں')}
              </span>
              {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showBreakdown && (
              <div className="mt-3 p-3 bg-[#F8F5F0] rounded-xl border border-[#E5DFD5] space-y-2 text-xs">
                {match.breakdown.map(item => (
                  <div key={item.key} className="flex items-start justify-between gap-2 border-b border-[#E5DFD5]/60 pb-1.5 last:border-none last:pb-0">
                    <div className="flex items-center gap-2">
                      {item.matched ? (
                        <div className="w-4 h-4 rounded-full bg-[#D4AF37] text-[#660A22] flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-[#A3182E] text-[#F8F5F0] flex items-center justify-center shrink-0">
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-[#2C2526]">
                          {isUr ? (item.labelUr || item.labelEn) : item.labelEn}:
                        </span>{' '}
                        <span className="text-[#6E6466]">{item.details}</span>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-[#800F2F] shrink-0">
                      {item.scoreContribution} / {item.maxScore} {tr('pts', 'نمبر')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-[#F8F5F0]/50 border-t border-[#E5DFD5] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link href={`/profiles/${partner.id}`}>
              <Button size="sm" variant="ghost" icon={<Eye className="w-3.5 h-3.5" />}>
                {tr('View Profile', 'پروفائل دیکھیں')}
              </Button>
            </Link>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowComparison(true)}
              icon={<ArrowLeftRight className="w-3.5 h-3.5 text-[#800F2F]" />}
            >
              {tr('Compare Side-by-Side', 'آمنے سامنے موازنہ')}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleShareWhatsApp}
              icon={<Share2 className="w-3.5 h-3.5 text-[#800F2F]" />}
              title={tr('Share sanitized summary with family on WhatsApp', 'واٹس ایپ پر خاندان کے ساتھ خلاصہ شیئر کریں')}
            >
              {tr('Share Summary', 'خلاصہ شیئر کریں')}
            </Button>

            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                if (onSendProposal) onSendProposal(partner);
              }}
              icon={<HeartHandshake className="w-3.5 h-3.5 text-[#D4AF37]" />}
            >
              {tr('Send Proposal', 'پروپوزل بھیجیں')}
            </Button>
          </div>
        </div>
      </div>

      {/* Comparison Modal */}
      {showComparison && (
        <ProfileComparisonModal
          profileA={sourceProfile}
          profileB={partner}
          match={match}
          onClose={() => setShowComparison(false)}
        />
      )}
    </>
  );
}

