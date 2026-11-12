'use client';

import React from 'react';
import { Star, Check, AlertTriangle, Clock, ShieldCheck, XCircle } from 'lucide-react';
import { ProfileStatus, MatchTier } from '@/lib/types';
import { useLanguage } from '@/lib/useLanguage';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'premium' | 'matches' | 'status' | 'outline' | 'neutral';
  status?: ProfileStatus;
  tier?: MatchTier;
  className?: string;
}

export function Badge({
  children,
  variant = 'neutral',
  status,
  tier,
  className = '',
}: BadgeProps) {
  const { tr } = useLanguage();

  // 1. Premium Rishtay Tier
  if (tier === 'premium' || variant === 'premium') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-[#D4AF37] text-[#660A22] shadow-sm select-none ${className}`}
      >
        <Star className="w-3.5 h-3.5 fill-[#660A22] text-[#660A22]" />
        <span>{children || tr('Premium Rishta', 'پریمیم رشتہ')}</span>
      </span>
    );
  }

  // 2. Matches Tier (50% - 74%)
  if (tier === 'matches' || variant === 'matches') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-[#800F2F] text-[#F8F5F0] border border-[#96163A] select-none ${className}`}
      >
        <span>{children || tr('Compatible Match', 'موزوں رشتہ')}</span>
      </span>
    );
  }

  // 3. Status Badges strictly inside palette (No green, no red!)
  if (status) {
    switch (status) {
      case 'available':
      case 'active':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFFFFF] text-[#800F2F] border border-[#D4AF37] select-none ${className}`}
          >
            <Check className="w-3 h-3 text-[#D4AF37] stroke-[2.5]" />
            <span>{tr('Available', 'دستیاب')}</span>
          </span>
        );
      case 'pending_approval':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F8F5F0] text-[#6E6466] border border-[#D8D0C3] select-none ${className}`}
          >
            <Clock className="w-3 h-3 text-[#6E6466]" />
            <span>{tr('Pending Review', 'زیرِ غور')}</span>
          </span>
        );
      case 'engaged':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D4AF37]/20 text-[#800F2F] border border-[#D4AF37] select-none ${className}`}
          >
            <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
            <span>{tr('Engaged', 'منگنی شدہ')}</span>
          </span>
        );
      case 'married':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#800F2F] text-[#F8F5F0] select-none ${className}`}
          >
            <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
            <span>{tr('Married', 'شادی شدہ')}</span>
          </span>
        );
      case 'on_hold':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F8F5F0] text-[#6E6466] border border-[#E5DFD5] select-none ${className}`}
          >
            <Clock className="w-3 h-3 text-[#6E6466]" />
            <span>{tr('On Hold', 'روکا گیا')}</span>
          </span>
        );
      case 'rejected':
      case 'closed':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFFFFF] text-[#A3182E] border border-[#A3182E]/40 select-none ${className}`}
          >
            <XCircle className="w-3 h-3 text-[#A3182E]" />
            <span>{status === 'rejected' ? tr('Rejected', 'مسترد') : tr('Closed', 'بند')}</span>
          </span>
        );
    }
  }

  // 4. Default Outline / Neutral
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFFFFF] text-[#800F2F] border border-[#E5DFD5] select-none ${className}`}
    >
      {children}
    </span>
  );
}

