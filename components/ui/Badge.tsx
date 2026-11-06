import React from 'react';
import { Star, Check, AlertTriangle, Clock, ShieldCheck, XCircle } from 'lucide-react';
import { ProfileStatus, MatchTier } from '@/lib/types';

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
  // 1. Premium Rishtay Tier
  if (tier === 'premium' || variant === 'premium') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-[#D9A93F] text-[#420610] shadow-sm select-none ${className}`}
      >
        <Star className="w-3.5 h-3.5 fill-[#420610] text-[#420610]" />
        <span>{children || 'Premium Rishta'}</span>
      </span>
    );
  }

  // 2. Matches Tier (50% - 74%)
  if (tier === 'matches' || variant === 'matches') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-[#5A0A14] text-[#FBF4E6] border border-[#7A1424] select-none ${className}`}
      >
        <span>{children || 'Compatible Match'}</span>
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
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFFDF8] text-[#5A0A14] border border-[#D9A93F] select-none ${className}`}
          >
            <Check className="w-3 h-3 text-[#D9A93F] stroke-[2.5]" />
            <span>Available</span>
          </span>
        );
      case 'pending_approval':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FBF4E6] text-[#7B5E5E] border border-[#DECEAC] select-none ${className}`}
          >
            <Clock className="w-3 h-3 text-[#7B5E5E]" />
            <span>Pending Review</span>
          </span>
        );
      case 'engaged':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D9A93F]/20 text-[#5A0A14] border border-[#D9A93F] select-none ${className}`}
          >
            <Star className="w-3 h-3 text-[#D9A93F] fill-[#D9A93F]" />
            <span>Engaged</span>
          </span>
        );
      case 'married':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#5A0A14] text-[#FBF4E6] select-none ${className}`}
          >
            <ShieldCheck className="w-3 h-3 text-[#D9A93F]" />
            <span>Married</span>
          </span>
        );
      case 'on_hold':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FBF4E6] text-[#7B5E5E] border border-[#E9DDC3] select-none ${className}`}
          >
            <Clock className="w-3 h-3 text-[#7B5E5E]" />
            <span>On Hold</span>
          </span>
        );
      case 'rejected':
      case 'closed':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFFDF8] text-[#8E1B2B] border border-[#8E1B2B]/40 select-none ${className}`}
          >
            <XCircle className="w-3 h-3 text-[#8E1B2B]" />
            <span>{status === 'rejected' ? 'Rejected' : 'Closed'}</span>
          </span>
        );
    }
  }

  // 4. Default Outline / Neutral
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFFDF8] text-[#5A0A14] border border-[#E9DDC3] select-none ${className}`}
    >
      {children}
    </span>
  );
}

