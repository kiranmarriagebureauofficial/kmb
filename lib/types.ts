export type Gender = 'Male' | 'Female';

export type MaritalStatus = 'Never Married' | 'Divorced' | 'Widowed' | 'Separated';

export type EducationLevel = 
  | 'Matric'
  | 'Intermediate'
  | 'Bachelors'
  | 'Masters'
  | 'MPhil/PhD'
  | 'Professional/Other';

export type Religion = 'Islam' | 'Christianity' | 'Hinduism' | 'Other';

export type Maslak = 
  | 'Sunni / Hanafi'
  | 'Sunni / Deobandi'
  | 'Sunni / Barelvi'
  | 'Ahl-e-Hadith'
  | 'Shia'
  | 'Any / No Preference';

export type ProfileStatus = 
  | 'active'
  | 'pending_approval'
  | 'on_hold'
  | 'engaged'
  | 'married'
  | 'closed'
  | 'rejected';

export type UserRole = 'admin' | 'staff';

export interface PartnerPreferences {
  ageMin: number;
  ageMax: number;
  heightMin: string; // e.g. "5'2\""
  heightMax: string; // e.g. "6'0\""
  cities: string[]; // e.g. ["Lahore", "Islamabad"]
  educationMin: EducationLevel;
  maritalStatuses: MaritalStatus[]; // e.g. ["Never Married"]
  castes: string[]; // e.g. ["Arain", "Rajput"] or ["Any"]
  maslak: Maslak;
  minIncome: number; // e.g. 100000
  otherNotes?: string;
}

export interface Profile {
  id: string;
  formNo: string; // e.g. "KMB-0001"
  dateApplied: string; // YYYY-MM-DD
  appliedBy: string; // e.g. "Father", "Mother", "Self"
  
  // Personal
  name: string;
  gender: Gender;
  age: number;
  dateOfBirth?: string;
  maritalStatus: MaritalStatus;
  secondMarriageDetails?: {
    hasChildren: boolean;
    childrenCount: number;
    custody?: string;
  };
  height: string; // e.g. "5'10\"" or "178 cm"
  city: string;
  societyName?: string; // e.g. "DHA Phase 5", "Bahria Town", "Gulberg"
  
  // Education & Professional
  degree: string; // e.g. "BS Computer Science (FAST-NUCES)"
  educationLevel: EducationLevel;
  profession: string; // e.g. "Software Architect"
  designation?: string; // e.g. "Principal Engineer"
  experienceYears?: number;
  businessNameAddress?: string;
  monthlyIncome: number; // in PKR
  
  // Family
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  totalSiblings: number;
  brothersCount: number;
  sistersCount: number;
  marriedSiblingsCount: number;
  religion: Religion;
  caste: string; // e.g. "Arain", "Rajput", "Mughal", "Sheikh", "Butt"
  maslak: Maslak;
  
  // Contact (Staff/Admin only)
  phone: string;
  whatsapp: string;
  guardianName?: string;
  guardianPhone?: string;
  address: string;
  cnic?: string; // e.g. "35202-xxxxxxx-x" (Admin only or masked)
  photoUrl?: string;
  
  // Preferences
  preferences: PartnerPreferences;
  
  // Status & Membership
  status: ProfileStatus;
  rejectionReason?: string;
  premiumMember: boolean;
  premiumStartDate?: string;
  premiumEndDate?: string;
  
  // Internal remarks
  remarks?: string;
  
  createdAt: string;
  updatedAt: string;
}

export type MatchTier = 'matches' | 'premium';

export interface MatchBreakdownItem {
  key: string;
  labelEn: string;
  labelUr: string;
  matched: boolean;
  details?: string;
  scoreContribution: number;
  maxScore: number;
}

export interface MatchResult {
  id: string;
  profileAId: string;
  profileBId: string;
  partnerProfile: Profile;
  scoreAB: number; // How well B fits A's preferences (0-100)
  scoreBA: number; // How well A fits B's preferences (0-100)
  finalScore: number; // Average of both (0-100)
  tier: MatchTier; // 'matches' (50-74) | 'premium' (75+)
  mutual: boolean;
  breakdown: MatchBreakdownItem[];
  computedAt: string;
}

export type ProposalStatus = 
  | 'waiting'
  | 'interested'
  | 'not_interested'
  | 'meeting_scheduled'
  | 'finalized';

export interface Proposal {
  id: string;
  matchId?: string;
  profileAId: string;
  profileBId: string;
  profileAName: string;
  profileBName: string;
  sentDate: string;
  sentBy: string; // Staff user name
  status: ProposalStatus;
  followUpDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceType = 
  | 'registration'
  | 'premium'
  | 'success'
  | 'other';

export type InvoiceStatus = 
  | 'unpaid'
  | 'partial'
  | 'paid'
  | 'cancelled';

export type PaymentMethod = 
  | 'Cash'
  | 'Bank Transfer'
  | 'JazzCash'
  | 'Easypaisa';

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  receivedBy: string;
  receiptNumber: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-0001"
  profileId: string;
  clientName: string;
  clientPhone: string;
  proposalId?: string;
  invoiceType: InvoiceType;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  amountPaid: number;
  balance: number;
  status: InvoiceStatus;
  payments: InvoicePayment[];
  date: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  active: boolean;
  lastLogin?: string;
}

export interface MatchingSettings {
  hardFilters: {
    oppositeGender: boolean;
    sameReligion: boolean;
    sameMaslak: boolean;
    sameCaste: boolean;
    minimumEducation: boolean;
    onlyActiveStatus: boolean;
  };
  weights: {
    ageRange: number; // default 25
    city: number; // default 15
    height: number; // default 10
    maritalStatus: number; // default 15
    professionIncome: number; // default 15
    familySimilarity: number; // default 5
    educationBonus: number; // default 10
    softPreferences: number; // default 5
  };
  tierThresholds: {
    minScoreToShow: number; // default 50
    premiumScoreMin: number; // default 75
  };
}

export interface BureauSettings {
  bureauName: string;
  bureauTaglineEn: string;
  bureauTaglineUr: string;
  address: string;
  phone1: string;
  phone2: string;
  whatsapp: string;
  email: string;
  invoicePrefix: string;
  defaultLanguage: 'en' | 'ur';
  feeDefaults: {
    registrationFee: number;
    premiumMembershipFee: number;
    successFee: number;
  };
  matching: MatchingSettings;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: 'create' | 'edit' | 'delete' | 'approve' | 'reject' | 'payment' | 'status_change';
  entity: 'profile' | 'invoice' | 'proposal' | 'settings' | 'staff';
  entityId: string;
  details: string;
}
