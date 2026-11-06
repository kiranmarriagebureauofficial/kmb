'use client';

import { 
  Profile, 
  BureauSettings, 
  Invoice, 
  InvoicePayment, 
  Proposal, 
  StaffUser, 
  AuditLogEntry, 
  MatchResult,
  ProfileStatus 
} from '../types';
import { 
  SEED_PROFILES, 
  INITIAL_SETTINGS, 
  INITIAL_INVOICES, 
  INITIAL_PROPOSALS, 
  INITIAL_STAFF, 
  INITIAL_AUDIT_LOGS 
} from './seed-data';
import { calculateMatchesForProfile } from '../matching-engine';

const STORAGE_KEYS = {
  PROFILES: 'kmb_profiles_v1',
  SETTINGS: 'kmb_settings_v1',
  INVOICES: 'kmb_invoices_v1',
  PROPOSALS: 'kmb_proposals_v1',
  STAFF: 'kmb_staff_v1',
  AUDIT: 'kmb_audit_v1',
  CURRENT_USER: 'kmb_current_user_v1',
  LANGUAGE: 'kmb_lang_v1',
};

class DataStore {
  private profiles: Profile[] = [];
  private settings: BureauSettings = INITIAL_SETTINGS;
  private invoices: Invoice[] = [];
  private proposals: Proposal[] = [];
  private staff: StaffUser[] = INITIAL_STAFF;
  private auditLogs: AuditLogEntry[] = INITIAL_AUDIT_LOGS;
  private currentUser: StaffUser | null = INITIAL_STAFF[0]; // default admin
  private language: 'en' | 'ur' = 'en';
  private listeners: Set<() => void> = new Set();
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') {
      this.profiles = [...SEED_PROFILES];
      this.settings = { ...INITIAL_SETTINGS };
      this.invoices = [...INITIAL_INVOICES];
      this.proposals = [...INITIAL_PROPOSALS];
      this.staff = [...INITIAL_STAFF];
      this.auditLogs = [...INITIAL_AUDIT_LOGS];
      this.currentUser = INITIAL_STAFF[0];
      return;
    }

    try {
      const p = localStorage.getItem(STORAGE_KEYS.PROFILES);
      this.profiles = p ? JSON.parse(p) : [...SEED_PROFILES];

      const s = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      this.settings = s ? JSON.parse(s) : { ...INITIAL_SETTINGS };

      const inv = localStorage.getItem(STORAGE_KEYS.INVOICES);
      this.invoices = inv ? JSON.parse(inv) : [...INITIAL_INVOICES];

      const prop = localStorage.getItem(STORAGE_KEYS.PROPOSALS);
      this.proposals = prop ? JSON.parse(prop) : [...INITIAL_PROPOSALS];

      const st = localStorage.getItem(STORAGE_KEYS.STAFF);
      this.staff = st ? JSON.parse(st) : [...INITIAL_STAFF];

      const al = localStorage.getItem(STORAGE_KEYS.AUDIT);
      this.auditLogs = al ? JSON.parse(al) : [...INITIAL_AUDIT_LOGS];

      const cu = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      this.currentUser = cu ? JSON.parse(cu) : INITIAL_STAFF[0];

      const lang = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      this.language = (lang === 'ur' ? 'ur' : 'en');

      this.initialized = true;
    } catch (e) {
      console.warn('Failed to load from localStorage, using seed defaults', e);
      this.profiles = [...SEED_PROFILES];
      this.settings = { ...INITIAL_SETTINGS };
      this.invoices = [...INITIAL_INVOICES];
      this.proposals = [...INITIAL_PROPOSALS];
      this.staff = [...INITIAL_STAFF];
      this.auditLogs = [...INITIAL_AUDIT_LOGS];
      this.currentUser = INITIAL_STAFF[0];
    }
  }

  private save(key: string, data: any) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.error('Save failed:', e);
      }
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  // Language
  public getLanguage(): 'en' | 'ur' {
    return this.language;
  }

  public setLanguage(lang: 'en' | 'ur') {
    this.language = lang;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
      document.documentElement.setAttribute('dir', lang === 'ur' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', lang);
    }
    this.notify();
  }

  // Current User / Auth
  public getCurrentUser(): StaffUser | null {
    return this.currentUser;
  }

  public setCurrentUser(user: StaffUser | null) {
    this.currentUser = user;
    this.save(STORAGE_KEYS.CURRENT_USER, user);
  }

  // Profiles
  public getProfiles(): Profile[] {
    return [...this.profiles];
  }

  public getProfileById(id: string): Profile | undefined {
    return this.profiles.find(p => p.id === id);
  }

  public getProfileByFormNo(formNo: string): Profile | undefined {
    return this.profiles.find(p => p.formNo.toLowerCase() === formNo.toLowerCase());
  }

  public getPendingRequests(): Profile[] {
    return this.profiles.filter(p => p.status === 'pending_approval');
  }

  public getActiveProfiles(): Profile[] {
    return this.profiles.filter(p => p.status === 'active');
  }

  public checkDuplicatePhone(phone: string, excludeId?: string): Profile | null {
    const clean = phone.replace(/[^0-9]/g, '');
    if (!clean) return null;
    const match = this.profiles.find(p => {
      if (excludeId && p.id === excludeId) return false;
      const pClean = p.phone.replace(/[^0-9]/g, '');
      const wClean = p.whatsapp ? p.whatsapp.replace(/[^0-9]/g, '') : '';
      return pClean.includes(clean) || clean.includes(pClean) || (wClean && (wClean.includes(clean) || clean.includes(wClean)));
    });
    return match || null;
  }

  public getNextFormNo(): string {
    const numbers = this.profiles
      .map(p => {
        const m = p.formNo.match(/KMB-(\d+)/);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const max = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `KMB-${String(max + 1).padStart(4, '0')}`;
  }

  public addProfile(profileData: Omit<Profile, 'id' | 'formNo' | 'createdAt' | 'updatedAt'> & { formNo?: string }): Profile {
    const formNo = profileData.formNo || this.getNextFormNo();
    const id = `prof-${Date.now()}`;
    const newProfile: Profile = {
      ...profileData,
      id,
      formNo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.profiles.unshift(newProfile);
    this.save(STORAGE_KEYS.PROFILES, this.profiles);

    this.logAudit({
      action: 'create',
      entity: 'profile',
      entityId: id,
      details: `Created profile ${formNo} (${newProfile.name})`,
    });

    return newProfile;
  }

  public updateProfile(id: string, updates: Partial<Profile>): Profile | null {
    const idx = this.profiles.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const old = this.profiles[idx];
    const updated: Profile = {
      ...old,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.profiles[idx] = updated;
    this.save(STORAGE_KEYS.PROFILES, this.profiles);

    this.logAudit({
      action: 'edit',
      entity: 'profile',
      entityId: id,
      details: `Updated profile ${updated.formNo} (${updated.name})`,
    });

    return updated;
  }

  public updateProfileStatus(id: string, status: ProfileStatus, rejectionReason?: string): Profile | null {
    const profile = this.getProfileById(id);
    if (!profile) return null;

    return this.updateProfile(id, {
      status,
      rejectionReason: status === 'rejected' ? rejectionReason : undefined,
    });
  }

  public deleteProfile(id: string): boolean {
    const p = this.getProfileById(id);
    if (!p) return false;

    this.profiles = this.profiles.filter(item => item.id !== id);
    this.save(STORAGE_KEYS.PROFILES, this.profiles);

    this.logAudit({
      action: 'delete',
      entity: 'profile',
      entityId: id,
      details: `Deleted profile ${p.formNo} (${p.name})`,
    });

    return true;
  }

  // Matches
  public getMatchesForProfile(profileId: string): MatchResult[] {
    const target = this.getProfileById(profileId);
    if (!target) return [];
    return calculateMatchesForProfile(target, this.profiles, this.settings.matching);
  }

  public getAllPremiumMatches(): { profileA: Profile; profileB: Profile; match: MatchResult }[] {
    const activeProfiles = this.getActiveProfiles();
    const pairs: { profileA: Profile; profileB: Profile; match: MatchResult }[] = [];
    const seen = new Set<string>();

    for (const a of activeProfiles) {
      if (a.gender !== 'Male') continue; // only check male-to-female to avoid duplication
      const matches = calculateMatchesForProfile(a, activeProfiles, this.settings.matching);
      for (const m of matches) {
        if (m.tier === 'premium') {
          const pairKey = [a.id, m.partnerProfile.id].sort().join('_');
          if (!seen.has(pairKey)) {
            seen.add(pairKey);
            pairs.push({
              profileA: a,
              profileB: m.partnerProfile,
              match: m,
            });
          }
        }
      }
    }

    return pairs.sort((x, y) => y.match.finalScore - x.match.finalScore);
  }

  // Invoices
  public getInvoices(): Invoice[] {
    return [...this.invoices];
  }

  public getInvoiceById(id: string): Invoice | undefined {
    return this.invoices.find(inv => inv.id === id);
  }

  public getNextInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    const numbers = this.invoices
      .map(inv => {
        const m = inv.invoiceNumber.match(/INV-\d+-(\d+)/);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const max = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `${prefix}${String(max + 1).padStart(4, '0')}`;
  }

  public createInvoice(data: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt' | 'amountPaid' | 'balance' | 'status' | 'payments'> & { initialPayment?: number; paymentMethod?: string }): Invoice {
    const id = `inv-${Date.now()}`;
    const invoiceNumber = this.getNextInvoiceNumber();
    const initialPay = data.initialPayment || 0;
    const balance = Math.max(0, data.total - initialPay);
    const status = balance === 0 ? 'paid' : initialPay > 0 ? 'partial' : 'unpaid';

    const payments: InvoicePayment[] = initialPay > 0 ? [
      {
        id: `pay-${Date.now()}`,
        invoiceId: id,
        amount: initialPay,
        paymentDate: data.date,
        paymentMethod: (data.paymentMethod as any) || 'Cash',
        receivedBy: this.currentUser?.name || 'Staff',
        receiptNumber: `REC-${invoiceNumber.replace('INV-', '')}-1`,
        notes: 'Initial payment at invoice creation',
      }
    ] : [];

    const newInvoice: Invoice = {
      ...data,
      id,
      invoiceNumber,
      amountPaid: initialPay,
      balance,
      status,
      payments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.invoices.unshift(newInvoice);
    this.save(STORAGE_KEYS.INVOICES, this.invoices);

    this.logAudit({
      action: 'create',
      entity: 'invoice',
      entityId: id,
      details: `Created invoice ${invoiceNumber} for ${data.clientName} (PKR ${data.total})`,
    });

    return newInvoice;
  }

  public recordPayment(invoiceId: string, paymentData: Omit<InvoicePayment, 'id' | 'invoiceId'>): Invoice | null {
    const idx = this.invoices.findIndex(inv => inv.id === invoiceId);
    if (idx === -1) return null;

    const inv = this.invoices[idx];
    const newPayment: InvoicePayment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      invoiceId,
    };

    const newPayments = [...inv.payments, newPayment];
    const newPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
    const newBalance = Math.max(0, inv.total - newPaid);
    const newStatus = newBalance === 0 ? 'paid' : 'partial';

    const updated: Invoice = {
      ...inv,
      payments: newPayments,
      amountPaid: newPaid,
      balance: newBalance,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    this.invoices[idx] = updated;
    this.save(STORAGE_KEYS.INVOICES, this.invoices);

    this.logAudit({
      action: 'payment',
      entity: 'invoice',
      entityId: invoiceId,
      details: `Recorded payment of PKR ${paymentData.amount} for ${inv.invoiceNumber} via ${paymentData.paymentMethod}`,
    });

    return updated;
  }

  public cancelInvoice(id: string): Invoice | null {
    const idx = this.invoices.findIndex(inv => inv.id === id);
    if (idx === -1) return null;

    const updated: Invoice = {
      ...this.invoices[idx],
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    };

    this.invoices[idx] = updated;
    this.save(STORAGE_KEYS.INVOICES, this.invoices);

    this.logAudit({
      action: 'edit',
      entity: 'invoice',
      entityId: id,
      details: `Cancelled invoice ${updated.invoiceNumber}`,
    });

    return updated;
  }

  // Proposals
  public getProposals(): Proposal[] {
    return [...this.proposals];
  }

  public addProposal(data: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>): Proposal {
    const id = `prop-${Date.now()}`;
    const newProp: Proposal = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.proposals.unshift(newProp);
    this.save(STORAGE_KEYS.PROPOSALS, this.proposals);

    this.logAudit({
      action: 'create',
      entity: 'proposal',
      entityId: id,
      details: `Sent proposal between ${data.profileAName} and ${data.profileBName}`,
    });

    return newProp;
  }

  public updateProposal(id: string, updates: Partial<Proposal>): Proposal | null {
    const idx = this.proposals.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const updated: Proposal = {
      ...this.proposals[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.proposals[idx] = updated;
    this.save(STORAGE_KEYS.PROPOSALS, this.proposals);

    this.logAudit({
      action: 'edit',
      entity: 'proposal',
      entityId: id,
      details: `Updated proposal ${id} status to ${updates.status || 'modified'}`,
    });

    return updated;
  }

  // Mark Rishta Done Workflow
  public markRishtaDone(proposalId: string, billedProfileId: string, feeAmount: number): {
    proposal: Proposal;
    invoice: Invoice;
  } | null {
    const prop = this.proposals.find(p => p.id === proposalId);
    if (!prop) return null;

    // 1. Update proposal status to finalized
    this.updateProposal(proposalId, {
      status: 'finalized',
      notes: (prop.notes ? prop.notes + '\n' : '') + `[${new Date().toLocaleDateString()}] Mark as Rishta Done completed.`,
    });

    // 2. Set both profiles to engaged (and exclude from matches)
    this.updateProfileStatus(prop.profileAId, 'engaged');
    this.updateProfileStatus(prop.profileBId, 'engaged');

    // 3. Create success fee invoice
    const billedProfile = this.getProfileById(billedProfileId) || this.getProfileById(prop.profileAId);
    const invoice = this.createInvoice({
      profileId: billedProfile ? billedProfile.id : prop.profileAId,
      clientName: billedProfile ? `${billedProfile.name} (${billedProfile.formNo})` : prop.profileAName,
      clientPhone: billedProfile ? billedProfile.phone : '+92 300 0000000',
      proposalId,
      invoiceType: 'success',
      items: [
        {
          id: `item-success-${Date.now()}`,
          description: `Success Fee for Rishta Completion: ${prop.profileAName} & ${prop.profileBName}`,
          amount: feeAmount || this.settings.feeDefaults.successFee,
        }
      ],
      subtotal: feeAmount || this.settings.feeDefaults.successFee,
      discount: 0,
      total: feeAmount || this.settings.feeDefaults.successFee,
      date: new Date().toISOString().split('T')[0],
      notes: `Final success fee for finalized marriage proposal #${proposalId}`,
    });

    this.logAudit({
      action: 'status_change',
      entity: 'proposal',
      entityId: proposalId,
      details: `Rishta Done! Both profiles set to Engaged. Success fee invoice ${invoice.invoiceNumber} generated.`,
    });

    return {
      proposal: prop,
      invoice,
    };
  }

  // Settings
  public getSettings(): BureauSettings {
    return { ...this.settings };
  }

  public updateSettings(updates: Partial<BureauSettings>): BureauSettings {
    this.settings = {
      ...this.settings,
      ...updates,
    };
    this.save(STORAGE_KEYS.SETTINGS, this.settings);

    this.logAudit({
      action: 'edit',
      entity: 'settings',
      entityId: 'global_settings',
      details: 'Updated bureau and matching configuration settings',
    });

    return { ...this.settings };
  }

  // Staff
  public getStaff(): StaffUser[] {
    return [...this.staff];
  }

  public addStaffUser(user: Omit<StaffUser, 'id'>): StaffUser {
    const newUser: StaffUser = {
      ...user,
      id: `staff-${Date.now()}`,
    };
    this.staff.push(newUser);
    this.save(STORAGE_KEYS.STAFF, this.staff);

    this.logAudit({
      action: 'create',
      entity: 'staff',
      entityId: newUser.id,
      details: `Added new staff member: ${newUser.name} (${newUser.role})`,
    });

    return newUser;
  }

  public toggleStaffStatus(id: string): boolean {
    const s = this.staff.find(x => x.id === id);
    if (!s) return false;
    s.active = !s.active;
    this.save(STORAGE_KEYS.STAFF, this.staff);
    return true;
  }

  // Audit Logs
  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }

  private logAudit(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'actorName' | 'actorRole'>) {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      actorName: this.currentUser?.name || 'System / Guest',
      actorRole: this.currentUser?.role || 'staff',
    };
    this.auditLogs.unshift(newEntry);
    this.save(STORAGE_KEYS.AUDIT, this.auditLogs.slice(0, 100)); // retain latest 100
  }

  // Reset to seed defaults
  public resetToDefaults() {
    this.profiles = [...SEED_PROFILES];
    this.settings = { ...INITIAL_SETTINGS };
    this.invoices = [...INITIAL_INVOICES];
    this.proposals = [...INITIAL_PROPOSALS];
    this.staff = [...INITIAL_STAFF];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.currentUser = INITIAL_STAFF[0];
    
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    this.notify();
  }
}

// Singleton export
export const store = new DataStore();
