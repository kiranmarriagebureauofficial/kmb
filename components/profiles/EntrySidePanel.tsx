'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Profile, MatchResult } from '@/lib/types';
import { calculateMatchesForProfile } from '@/lib/matching-engine';
import { store } from '@/lib/db/store';
import { MatchRing } from '../ui/MatchRing';
import { Badge } from '../ui/Badge';
import { ProfileAvatar } from '../ui/ProfileAvatar';
import { Star, Sparkles, ExternalLink, Users, ChevronRight, AlertCircle } from 'lucide-react';

interface EntrySidePanelProps {
  currentFormValues: Partial<Profile>;
  savedProfileId?: string;
  hasEnteredData?: boolean;
  className?: string;
}

export function EntrySidePanel({
  currentFormValues,
  savedProfileId,
  hasEnteredData = true,
  className = '',
}: EntrySidePanelProps) {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const prefsKey = JSON.stringify(currentFormValues.preferences || {});

  useEffect(() => {
    if (!savedProfileId && !hasEnteredData) {
      setMatches([]);
      setIsCalculating(false);
      return;
    }

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
    currentFormValues.name,
    currentFormValues.gender,
    currentFormValues.age,
    currentFormValues.height,
    currentFormValues.maritalStatus,
    currentFormValues.religion,
    currentFormValues.caste,
    currentFormValues.maslak,
    currentFormValues.educationLevel,
    currentFormValues.degree,
    currentFormValues.profession,
    currentFormValues.monthlyIncome,
    currentFormValues.city,
    prefsKey,
    savedProfileId,
    hasEnteredData,
  ]);

  const premiumCount = matches.filter(m => m.tier === 'premium').length;
  const regularCount = matches.filter(m => m.tier === 'matches').length;

  return (
    <aside
      className={`bg-[#FFFFFF] border border-[#E5DFD5] rounded-xl shadow-md p-4 flex flex-col h-full select-none ${className}`}
    >
      {/* Side Panel Header */}
      <div className="pb-3 border-b border-[#E5DFD5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-serif font-bold text-sm text-[#800F2F] tracking-wide">
              Live Compatibility Engine
            </h3>
          </div>
          {isCalculating ? (
            <span className="text-[10px] text-[#6E6466] animate-pulse">Analyzing...</span>
          ) : (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#800F2F] text-[#F8F5F0]">
              {matches.length} Matches Found
            </span>
          )}
        </div>

        {/* Sub-counts */}
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          <div className="bg-[#F8F5F0] p-2 rounded-lg border border-[#E5DFD5] text-center">
            <span className="text-xs text-[#6E6466] block leading-tight">Matches (50-74%)</span>
            <span className="text-base font-serif font-bold text-[#800F2F]">{regularCount}</span>
          </div>
          <div className="bg-[#F8F5F0] p-2 rounded-lg border border-[#D4AF37]/50 text-center">
            <div className="flex items-center justify-center gap-1 text-[#B88B22] text-xs">
              <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
              <span className="font-semibold">Premium (75%+)</span>
            </div>
            <span className="text-base font-serif font-bold text-[#B88B22]">{premiumCount}</span>
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
        {!savedProfileId && !hasEnteredData ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#6E6466]">
            <Sparkles className="w-8 h-8 text-[#D4AF37]/70 mb-2" />
            <p className="text-xs font-semibold text-[#800F2F]">
              Live Matching Ready
            </p>
            <p className="text-[11px] text-[#6E6466] mt-1 leading-relaxed">
              Matches will appear live here as you enter candidate details (gender, age, caste, city &amp; preferences).
            </p>
          </div>
        ) : matches.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#6E6466]">
            <Users className="w-8 h-8 text-[#D8D0C3] mb-2" />
            <p className="text-xs font-medium">No 50%+ compatible rishtas found yet.</p>
            <p className="text-[11px] text-[#6E6466]/80 mt-1">
              Verify opposite gender, religion, caste &amp; sect preferences.
            </p>
          </div>
        ) : (
          matches.slice(0, 6).map(m => {
            const partner = m.partnerProfile;
            return (
              <div
                key={m.id}
                className="p-3 rounded-lg bg-[#F8F5F0] border border-[#E5DFD5] hover:border-[#D4AF37] transition-all flex items-center justify-between gap-3 group"
              >
                {/* Photo / Avatar */}
                <ProfileAvatar
                  name={partner.name}
                  photoUrl={partner.photoUrl}
                  size="sm"
                  isPremium={partner.premiumMember}
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#800F2F]/10 text-[#800F2F]">
                      {partner.formNo}
                    </span>
                    <h4 className="text-xs font-bold text-[#2C2526] truncate group-hover:text-[#800F2F]">
                      {partner.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#6E6466] truncate mt-0.5">
                    {partner.age} yrs • {partner.caste} • {partner.city}
                  </p>
                  <p className="text-[10px] text-[#2C2526]/70 truncate">
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
        <div className="pt-3 border-t border-[#E5DFD5]">
          <Link
            href={`/profiles/${savedProfileId}/matches`}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-[#800F2F] hover:bg-[#660A22] text-[#F8F5F0] transition-colors"
          >
            <span>View All {matches.length} Matches</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
          </Link>
        </div>
      ) : (
        <div className="pt-2 border-t border-[#E5DFD5] text-center">
          <span className="text-[11px] text-[#6E6466] italic">
            Save profile to view detailed breakdowns & proposals
          </span>
        </div>
      )}
    </aside>
  );
}

