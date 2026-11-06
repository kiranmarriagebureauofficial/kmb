import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Profile } from "./types";

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

export function maskCNIC(cnic?: string): string {
  if (!cnic) return 'N/A';
  // Standard Pakistani CNIC format: 35202-1234567-1 -> 35202-*******-1
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
  return `*Proposal Summary - ${bureauInfo.name}*
*Profile Ref:* ${profile.formNo}

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
