'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MatchResult, Profile } from '@/lib/types';
import { store } from '@/lib/db/store';
import { MatchRing } from '../ui/MatchRing';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
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

interface MatchCardProps {
  match: MatchResult;
  sourceProfile: Profile;
  onSendProposal?: (partnerProfile: Profile) => void;
}

export function MatchCard({ match, sourceProfile, onSendProposal }: MatchCardProps) {
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
      <div className="bg-[#FFFDF8] border border-[#E9DDC3] rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden border-l-4 hover:border-l-[#D9A93F] flex flex-col justify-between">
        <div className="p-5 space-y-4">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-[#5A0A14] text-[#D9A93F] border-2 border-[#D9A93F] flex items-center justify-center font-serif font-bold text-lg shrink-0 shadow-sm">
                {partner.name.charAt(0)}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif text-base font-bold text-[#2A0A0F]">
                    {partner.name}
                  </h3>
                  <span className="text-xs font-mono text-[#7B5E5E] bg-[#FBF4E6] px-1.5 py-0.5 rounded">
                    {partner.formNo}
                  </span>
                  {partner.premiumMember && (
                    <Badge variant="premium">Premium Member</Badge>
                  )}
                </div>

                <p className="text-xs text-[#7B5E5E] mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span>{partner.age} Yrs</span>
                  <span>•</span>
                  <span>{partner.height}</span>
                  <span>•</span>
                  <span className="font-semibold text-[#5A0A14]">{partner.caste}</span>
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
                {match.tier === 'premium' ? '75%+ Premium' : 'Compatible'}
              </Badge>
            </div>
          </div>

          {/* Quick Details Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FBF4E6] border border-[#E9DDC3]">
              <MapPin className="w-3.5 h-3.5 text-[#D9A93F] shrink-0" />
              <span className="truncate">{partner.city} ({partner.societyName || 'Lahore'})</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FBF4E6] border border-[#E9DDC3]">
              <GraduationCap className="w-3.5 h-3.5 text-[#D9A93F] shrink-0" />
              <span className="truncate">{partner.degree}</span>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#FBF4E6] border border-[#E9DDC3]">
              <Briefcase className="w-3.5 h-3.5 text-[#D9A93F] shrink-0" />
              <span className="truncate">{partner.profession}</span>
            </div>
          </div>

          {/* Two-Way Scoring Metrics */}
          <div className="p-3 bg-[#FBF4E6] rounded-xl border border-[#E9DDC3] flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7B5E5E] block">
                Two-Way Compatibility
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span>
                  Candidate Suitability: <strong className="text-[#5A0A14]">{match.scoreAB}%</strong>
                </span>
                <span className="text-[#DECEAC]">|</span>
                <span>
                  Partner Suitability: <strong className="text-[#5A0A14]">{match.scoreBA}%</strong>
                </span>
              </div>
            </div>

            {match.mutual && (
              <span className="px-2 py-1 rounded bg-[#D9A93F]/20 text-[#5A0A14] border border-[#D9A93F] text-[11px] font-bold">
                ✓ High Mutual Fit
              </span>
            )}
          </div>

          {/* Collapsible Compatibility Breakdown (Gold checks, maroon crosses) */}
          <div>
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-xs font-semibold text-[#5A0A14] hover:text-[#7A1424] flex items-center gap-1.5 transition-colors"
            >
              <span>{showBreakdown ? 'Hide Compatibility Factors' : 'View Compatibility Factors & Match Analysis'}</span>
              {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showBreakdown && (
              <div className="mt-3 p-3 bg-[#FBF4E6] rounded-xl border border-[#E9DDC3] space-y-2 text-xs">
                {match.breakdown.map(item => (
                  <div key={item.key} className="flex items-start justify-between gap-2 border-b border-[#E9DDC3]/60 pb-1.5 last:border-none last:pb-0">
                    <div className="flex items-center gap-2">
                      {item.matched ? (
                        <div className="w-4 h-4 rounded-full bg-[#D9A93F] text-[#420610] flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-[#8E1B2B] text-[#FBF4E6] flex items-center justify-center shrink-0">
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-[#2A0A0F]">{item.labelEn}:</span>{' '}
                        <span className="text-[#7B5E5E]">{item.details}</span>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono font-bold text-[#5A0A14] shrink-0">
                      {item.scoreContribution} / {item.maxScore} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-[#FBF4E6]/50 border-t border-[#E9DDC3] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link href={`/profiles/${partner.id}`}>
              <Button size="sm" variant="ghost" icon={<Eye className="w-3.5 h-3.5" />}>
                View Profile
              </Button>
            </Link>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowComparison(true)}
              icon={<ArrowLeftRight className="w-3.5 h-3.5 text-[#5A0A14]" />}
            >
              Compare Side-by-Side
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleShareWhatsApp}
              icon={<Share2 className="w-3.5 h-3.5 text-[#5A0A14]" />}
              title="Share sanitized summary with family on WhatsApp"
            >
              Share Summary
            </Button>

            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                if (onSendProposal) onSendProposal(partner);
              }}
              icon={<HeartHandshake className="w-3.5 h-3.5 text-[#D9A93F]" />}
            >
              Send Proposal
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
