'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Profile, MatchResult } from '@/lib/types';
import { calculateMatchesForProfile } from '@/lib/matching-engine';
import { store } from '@/lib/db/store';
import { MatchRing } from '../ui/MatchRing';
import { Badge } from '../ui/Badge';
import { Star, Sparkles, ExternalLink, Users, ChevronRight, AlertCircle } from 'lucide-react';

interface EntrySidePanelProps {
  currentFormValues: Partial<Profile>;
  savedProfileId?: string;
  className?: string;
}

export function EntrySidePanel({
  currentFormValues,
  savedProfileId,
  className = '',
}: EntrySidePanelProps) {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    // Debounce calculation
    const timer = setTimeout(() => {
      setIsCalculating(true);
      try {
        const allActive = store.getActiveProfiles();
        
        // Construct a synthetic profile from the current form values
        const nowIso = new Date().toISOString();
        const candidateProfile: Profile = {
          id: savedProfileId || 'draft-profile',
          formNo: currentFormValues.formNo || 'DRAFT',
          entryDate: currentFormValues.entryDate || currentFormValues.dateApplied || nowIso.split('T')[0],
          dateApplied: currentFormValues.dateApplied || nowIso.split('T')[0],
          appliedBy: currentFormValues.appliedBy || 'Self',
          lastActivityAt: nowIso,
          name: currentFormValues.name || 'Candidate',
          gender: currentFormValues.gender || 'Male',
          age: Number(currentFormValues.age) || 28,
          maritalStatus: currentFormValues.maritalStatus || 'Never Married',
          height: currentFormValues.height || "5'9\"",
          city: currentFormValues.city || 'Lahore',
          degree: currentFormValues.degree || 'Bachelors',
          educationLevel: currentFormValues.educationLevel || 'Bachelors',
          profession: currentFormValues.profession || 'Professional',
          monthlyIncome: Number(currentFormValues.monthlyIncome) || 200000,
          fatherName: currentFormValues.fatherName || 'Father',
          fatherOccupation: currentFormValues.fatherOccupation || 'Business',
          motherName: currentFormValues.motherName || 'Mother',
          motherOccupation: currentFormValues.motherOccupation || 'Homemaker',
          totalSiblings: Number(currentFormValues.totalSiblings) || 2,
          brothersCount: Number(currentFormValues.brothersCount) || 1,
          sistersCount: Number(currentFormValues.sistersCount) || 1,
          marriedSiblingsCount: Number(currentFormValues.marriedSiblingsCount) || 0,
          religion: currentFormValues.religion || 'Islam',
          caste: currentFormValues.caste || 'Arain',
          maslak: currentFormValues.maslak || 'Sunni / Hanafi',
          phone: currentFormValues.phone || '+92 300 0000000',
          whatsapp: currentFormValues.whatsapp || '+92 300 0000000',
          address: currentFormValues.address || 'Lahore',
          status: 'available', // synthetic available for preview calculation
          premiumMember: !!currentFormValues.premiumMember,
          preferences: currentFormValues.preferences || {
            ageMin: 22,
            ageMax: 30,
            heightMin: "5'2\"",
            heightMax: "6'0\"",
            cities: ['Lahore'],
            educationMin: 'Bachelors',
            maritalStatuses: ['Never Married'],
            castes: [currentFormValues.caste || 'Any'],
            maslak: currentFormValues.maslak || 'Sunni / Hanafi',
            minIncome: 0,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const results = calculateMatchesForProfile(
          candidateProfile,
          allActive,
          store.getSettings().matching
        );
        setMatches(results);
      } catch (err) {
        console.error('Real-time matching error:', err);
      } finally {
        setIsCalculating(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [
    currentFormValues.gender,
    currentFormValues.age,
    currentFormValues.caste,
    currentFormValues.maslak,
    currentFormValues.educationLevel,
    currentFormValues.city,
    currentFormValues.preferences,
    savedProfileId,
  ]);

  const premiumCount = matches.filter(m => m.tier === 'premium').length;
  const regularCount = matches.filter(m => m.tier === 'matches').length;

  return (
    <aside
      className={`bg-[#FFFDF8] border border-[#E9DDC3] rounded-xl shadow-md p-4 flex flex-col h-full select-none ${className}`}
    >
      {/* Side Panel Header */}
      <div className="pb-3 border-b border-[#E9DDC3]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D9A93F]" />
            <h3 className="font-serif font-bold text-sm text-[#5A0A14] tracking-wide">
              Live Compatibility Engine
            </h3>
          </div>
          {isCalculating ? (
            <span className="text-[10px] text-[#7B5E5E] animate-pulse">Analyzing...</span>
          ) : (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#5A0A14] text-[#FBF4E6]">
              {matches.length} Matches Found
            </span>
          )}
        </div>

        {/* Sub-counts */}
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          <div className="bg-[#FBF4E6] p-2 rounded-lg border border-[#E9DDC3] text-center">
            <span className="text-xs text-[#7B5E5E] block leading-tight">Matches (50-74%)</span>
            <span className="text-base font-serif font-bold text-[#5A0A14]">{regularCount}</span>
          </div>
          <div className="bg-[#FBF4E6] p-2 rounded-lg border border-[#D9A93F]/50 text-center">
            <div className="flex items-center justify-center gap-1 text-[#B08626] text-xs">
              <Star className="w-3 h-3 fill-[#D9A93F] text-[#D9A93F]" />
              <span className="font-semibold">Premium (75%+)</span>
            </div>
            <span className="text-base font-serif font-bold text-[#B08626]">{premiumCount}</span>
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
        {matches.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#7B5E5E]">
            <Users className="w-8 h-8 text-[#DECEAC] mb-2" />
            <p className="text-xs font-medium">No 50%+ compatible rishtas found yet.</p>
            <p className="text-[11px] text-[#7B5E5E]/80 mt-1">
              Verify opposite gender, religion, caste & sect preferences.
            </p>
          </div>
        ) : (
          matches.slice(0, 6).map(m => {
            const partner = m.partnerProfile;
            return (
              <div
                key={m.id}
                className="p-3 rounded-lg bg-[#FBF4E6] border border-[#E9DDC3] hover:border-[#D9A93F] transition-all flex items-center justify-between gap-3 group"
              >
                {/* Photo / Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#5A0A14] text-[#D9A93F] border border-[#D9A93F] flex items-center justify-center font-serif font-bold text-sm shrink-0">
                  {partner.name.charAt(0)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <h4 className="text-xs font-bold text-[#2A0A0F] truncate group-hover:text-[#5A0A14]">
                      {partner.name}
                    </h4>
                    {partner.premiumMember && (
                      <Star className="w-3 h-3 fill-[#D9A93F] text-[#D9A93F] shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#7B5E5E] truncate">
                    {partner.age} yrs • {partner.caste} • {partner.city}
                  </p>
                  <p className="text-[10px] text-[#2A0A0F]/70 truncate">
                    {partner.degree}
                  </p>
                </div>

                {/* Match Ring */}
                <div className="shrink-0">
                  <MatchRing score={m.finalScore} size={42} strokeWidth={4} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Action */}
      {savedProfileId ? (
        <div className="pt-3 border-t border-[#E9DDC3]">
          <Link
            href={`/profiles/${savedProfileId}/matches`}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-[#5A0A14] hover:bg-[#420610] text-[#FBF4E6] transition-colors"
          >
            <span>View All {matches.length} Matches</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#D9A93F]" />
          </Link>
        </div>
      ) : (
        <div className="pt-2 border-t border-[#E9DDC3] text-center">
          <span className="text-[11px] text-[#7B5E5E] italic">
            Save profile to view detailed breakdowns & proposals
          </span>
        </div>
      )}
    </aside>
  );
}

