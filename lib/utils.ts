import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Profile, AgeBucket, AgeBucketConfig } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount: number): string {
  if (isNaN(amount)) return 'PKR 0';
  return `PKR ${amount.toLocaleString('en-PK')}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })} ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  } catch {
    return dateStr;
  }
}

export function calculateDaysInStock(entryDateStr: string): number {
  if (!entryDateStr) return 0;
  const entry = new Date(entryDateStr).getTime();
  const now = Date.now();
  const diffDays = Math.floor((now - entry) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export const DEFAULT_AGE_BUCKETS: AgeBucketConfig = {
  newDays: 7,
  recentDays: 30,
  agingDays: 90,
  oldDays: 180,
};

export function getAgeBucket(days: number, config = DEFAULT_AGE_BUCKETS): AgeBucket {
  if (days <= config.newDays) return 'new';
  if (days <= config.recentDays) return 'recent';
  if (days <= config.agingDays) return 'aging';
  if (days <= config.oldDays) return 'old';
  return 'very_old';
}

export function getAgeBucketLabel(bucket: AgeBucket): { label: string; textUr: string; badgeClass: string } {
  switch (bucket) {
    case 'new':
      return {
        label: 'New (0-7d)',
        textUr: 'نیا اندراج',
        badgeClass: 'bg-[#D4AF37]/20 text-[#800F2F] border border-[#D4AF37] font-bold',
      };
    case 'recent':
      return {
        label: 'Recent (8-30d)',
        textUr: 'حالیہ',
        badgeClass: 'bg-[#FFFFFF] text-[#800F2F] border border-[#E5DFD5]',
      };
    case 'aging':
      return {
        label: 'Aging (31-90d)',
        textUr: 'درمیانی مدت',
        badgeClass: 'bg-[#F8F5F0] text-[#6E6466] border border-[#D8D0C3]',
      };
    case 'old':
      return {
        label: 'Old Stock (91-180d)',
        textUr: 'پرانا اسٹاک',
        badgeClass: 'bg-[#FFFFFF] text-[#A3182E] border border-[#A3182E]/40 font-semibold',
      };
    case 'very_old':
      return {
        label: 'Stale (180d+)',
        textUr: 'طویل زیر التوا',
        badgeClass: 'bg-[#A3182E] text-[#F8F5F0] font-bold',
      };
  }
}

export function maskCNIC(cnic?: string): string {
  if (!cnic) return 'N/A';
  const clean = cnic.replace(/[^0-9]/g, '');
  if (clean.length === 13) {
    return `${clean.substring(0, 5)}-*******-${clean.substring(12, 13)}`;
  }
  return cnic.replace(/\d(?=\d{4})/g, '*');
}

export function maskPhone(phone?: string): string {
  if (!phone) return 'Confidential';
  const clean = phone.trim();
  if (clean.length <= 4) return '****';
  return clean.substring(0, 4) + ' •••••••';
}

export function generateWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function buildWhatsAppShareSummary(profile: Profile, bureauInfo: { name: string; phone: string }): string {
  return `*Proposal Profile - ${bureauInfo.name}*
*Inventory Ref:* ${profile.formNo}

*Candidate Details:*
• *Gender:* ${profile.gender}
• *Age & Height:* ${profile.age} yrs (${profile.height})
• *Marital Status:* ${profile.maritalStatus}
• *City / Area:* ${profile.city} (${profile.societyName || 'N/A'})
• *Education:* ${profile.degree} (${profile.educationLevel})
• *Profession:* ${profile.profession} ${profile.designation ? `(${profile.designation})` : ''}

*Family Background:*
• *Caste / Qaum:* ${profile.caste}
• *Sect / Maslak:* ${profile.maslak}
• *Father:* ${profile.fatherOccupation}
• *Mother:* ${profile.motherOccupation}
• *Siblings:* ${profile.totalSiblings} total (${profile.marriedSiblingsCount} married)

*Partner Preferences:*
• Age: ${profile.preferences.ageMin}-${profile.preferences.ageMax} yrs
• City: ${profile.preferences.cities.join(', ')}
• Caste: ${profile.preferences.castes.join(', ')}

_Note: Contact details are strictly private and shared after mutual family consent._
For inquiries, please contact:
*${bureauInfo.name}*
WhatsApp: ${bureauInfo.phone}`;
}
