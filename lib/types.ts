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

// Stock Status (Inventory ERP Lifecycle)
export type StockStatus = 
  | 'available'       // In stock, participating in matching
  | 'on_hold'         // Temporarily paused, excluded from matching
  | 'engaged'         // Rishta fixed / engaged, excluded from matching
  | 'married'         // Finished / closed, excluded from matching
  | 'pending_approval'// Online submission, not yet in inventory stock
  | 'rejected'
  | 'active'          // legacy alias for available
  | 'closed';         // legacy alias for married/finalized

// Backward compatibility alias
export type ProfileStatus = StockStatus;

export type AgeBucket = 'new' | 'recent' | 'aging' | 'old' | 'very_old';

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
  entryDate: string; // YYYY-MM-DD when stock item arrived
  dateApplied: string; // legacy alias
  appliedBy: string; // e.g. "Father", "Mother", "Self", "Bureau Staff"
  lastActivityAt: string; // ISO string when last proposal/edit occurred
  
  // Personal Details
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
  
  // Educational & Professional
  degree: string;
  educationLevel: EducationLevel;
  profession: string;
  designation?: string;
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
  caste: string; // e.g. "Arain", "Rajput", "Sheikh"
  maslak: Maslak;
  
  // Contact (Admin / Staff internal only)
  phone: string;
  whatsapp: string;
  guardianName?: string;
  guardianPhone?: string;
  address: string;
  cnic?: string; // e.g. "35202-xxxxxxx-x"
  photoUrl?: string;
  
  // Preferences
  preferences: PartnerPreferences;
  
  // Inventory Stock Status & VIP Membership
  status: StockStatus;
  rejectionReason?: string;
  premiumMember: boolean;
  isPremium?: boolean;
  area?: string;
  educationDetail?: string;
  familyDetails?: any;
  contactPerson?: string;
  notes?: string;
  premiumStartDate?: string;
  premiumEndDate?: string;
  
  // Internal Remarks (never shared)
  remarks?: string;
  
  createdAt: string;
  updatedAt: string;
}

export type MatchTier = 'matches' | 'premium' | 'standard';

export interface MatchBreakdownItem {
  key: string;
  labelEn: string;
  labelUr: string;
  matched: boolean;
  details?: string;
  scoreContribution: number;
  maxScore: number;
  criteria?: string;
  score?: number;
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
  | 'sent'
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
  sentDate?: string;
  sentBy?: string; // Staff user name
  status: ProposalStatus;
  matchScore?: number;
  followUpDate?: string;
  notes?: string;
  timeline?: any[];
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
  formNo?: string; // e.g. "KMB-0001" (Register / Form No)
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

export interface AgeBucketConfig {
  newDays: number;     // e.g. 7
  recentDays: number;  // e.g. 30
  agingDays: number;   // e.g. 90
  oldDays: number;     // e.g. 180
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
  enableOnlineRegistrationLink: boolean; // toggle public /register
  oldStockAlertDays: number; // e.g. 60 or 90 days without activity
  ageBuckets: AgeBucketConfig;
  feeDefaults: {
    registrationFee: number;
    premiumMembershipFee: number;
    successFee: number;
  };
  matching: MatchingSettings;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: 'create' | 'edit' | 'delete' | 'approve' | 'reject' | 'payment' | 'status_change' | 'proposal';
  entity: 'rishta' | 'invoice' | 'proposal' | 'settings' | 'staff' | 'profile';
  entityId: string;
  entityName?: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  details: string;
}

// Backward compatibility alias
export type AuditLogEntry = ActivityLogEntry;
