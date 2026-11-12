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
  INITIAL_SETTINGS 
} from './seed-data';
import { calculateMatchesForProfile } from '../matching-engine';

const STORAGE_KEYS = {
  PROFILES: 'kmb_profiles_v2',
  SETTINGS: 'kmb_settings_v2',
  INVOICES: 'kmb_invoices_v2',
  PROPOSALS: 'kmb_proposals_v2',
  STAFF: 'kmb_staff_v2',
  AUDIT: 'kmb_audit_v2',
  CURRENT_USER: 'kmb_current_user_v2',
  LANGUAGE: 'kmb_lang_v2',
};

class DataStore {
  private profiles: Profile[] = [];
  private settings: BureauSettings = INITIAL_SETTINGS;
  private invoices: Invoice[] = [];
  private proposals: Proposal[] = [];
  private staff: StaffUser[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private currentUser: StaffUser | null = null;
  private language: 'en' | 'ur' = 'en';
  private listeners: Set<() => void> = new Set();
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') {
      this.profiles = [];
      this.settings = { ...INITIAL_SETTINGS };
      this.invoices = [];
      this.proposals = [];
      this.staff = [];
      this.auditLogs = [];
      this.currentUser = null;
      return;
    }

    try {
      const p = localStorage.getItem(STORAGE_KEYS.PROFILES);
      this.profiles = p ? JSON.parse(p) : [];

      const s = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      this.settings = s ? JSON.parse(s) : { ...INITIAL_SETTINGS };

      const inv = localStorage.getItem(STORAGE_KEYS.INVOICES);
      this.invoices = inv ? JSON.parse(inv) : [];

      const prop = localStorage.getItem(STORAGE_KEYS.PROPOSALS);
      this.proposals = prop ? JSON.parse(prop) : [];

      const st = localStorage.getItem(STORAGE_KEYS.STAFF);
      this.staff = st ? JSON.parse(st) : [];

      const al = localStorage.getItem(STORAGE_KEYS.AUDIT);
      this.auditLogs = al ? JSON.parse(al) : [];

      const cu = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      this.currentUser = cu ? JSON.parse(cu) : null;

      const lang = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      this.language = (lang === 'ur' ? 'ur' : 'en');

      this.initialized = true;
    } catch (e) {
      console.warn('Failed to load from localStorage, starting with empty bureau store', e);
      this.profiles = [];
      this.settings = { ...INITIAL_SETTINGS };
      this.invoices = [];
      this.proposals = [];
      this.staff = [];
      this.auditLogs = [];
      this.currentUser = null;
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
    if (typeof window !== 'undefined') {
      try {
        if (user) {
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        } else {
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
      } catch (e) {
        console.error('Save current user failed:', e);
      }
    }
    this.notify();
  }

  public syncStaffFromServer(users: StaffUser[]) {
    this.staff = users;
    this.save(STORAGE_KEYS.STAFF, this.staff);
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
    return this.profiles.filter(p => p.status === 'available' || (p.status as any) === 'active');
  }

  public getAvailableProfiles(): Profile[] {
    return this.getActiveProfiles();
  }

  public getInventoryStats() {
    const available = this.getActiveProfiles();
    const maleStock = available.filter(p => p.gender === 'Male').length;
    const femaleStock = available.filter(p => p.gender === 'Female').length;
    
    const now = Date.now();
    let newThisWeek = 0;
    let newThisMonth = 0;
    let agingStock = 0;
    let oldStock = 0;
    let veryOldStock = 0;

    const config = this.settings.ageBuckets || { newDays: 7, recentDays: 30, agingDays: 90, oldDays: 180 };

    available.forEach(p => {
      const entryTime = new Date(p.entryDate || p.createdAt).getTime();
      const diffDays = Math.max(0, Math.floor((now - entryTime) / (1000 * 60 * 60 * 24)));
      if (diffDays <= config.newDays) newThisWeek++;
      else if (diffDays <= config.recentDays) newThisMonth++;
      else if (diffDays <= config.agingDays) agingStock++;
      else if (diffDays <= config.oldDays) oldStock++;
      else veryOldStock++;
    });

    const totalOldStock = oldStock + veryOldStock;

    // Age bucket distribution for stacked bar chart
    const stockByAgeBucket = [
      {
        bucket: 'new',
        label: 'New (0-7d)',
        male: available.filter(p => p.gender === 'Male' && Math.floor((now - new Date(p.entryDate || p.createdAt).getTime()) / 86400000) <= config.newDays).length,
        female: available.filter(p => p.gender === 'Female' && Math.floor((now - new Date(p.entryDate || p.createdAt).getTime()) / 86400000) <= config.newDays).length,
        total: 0,
      },
      {
        bucket: 'recent',
        label: 'Recent (8-30d)',
        male: available.filter(p => {
          const d = Math.floor((now - new Date(p.entryDate || p.createdAt).getTime()) / 86400000);
          return p.gender === 'Male' && d > config.newDays && d <= config.recentDays;
        }).length,
        female: available.filter(p => {
          const d = Math.floor((now - new Date(p.entryDate || p.createdAt).getTime()) / 86400000);
          return p.gender === 'Female' && d > config.newDays && d <= config.recentDays;
        }).length,
        total: 0,
      },
      {
        bucket: 'aging',
        label: 'Aging (31-90d)',
        male: available.filter(p => {
          const d = Math.floor((now - new Date(p.entryDate || p.createdAt).getTime()) / 86400000);
          return p.gender === 'Male' && d > config.recentDays && d <= config.agingDays;
        }).length,
        female: available.filter(p => {
          const d = Math.floor((now - new Date(p.entryDate || p.createdAt).getTime()) / 86400000);
          return p.gender === 'Female' && d > config.recentDays && d <= config.agingDays;
        }).length,
        total: 0,
      },
      {
        bucket: 'old',
        label: 'Old (91-180d)',
        male: available.filter(p => {
          const d = Math.floor((now - new Date(p.entryDate || p.createdAt).getTime()) / 86400000);
          return p.gender === 'Male' && d > config.agingDays && d <= config.oldDays;
        }).length,
        female: available.filter(p => {
          const d = Math.floor((now - new Date(p.entryDate || p.createdAt).getTime()) / 86400000);
          return p.gender === 'Female' && d > config.agingDays && d <= config.oldDays;
        }).length,
        total: 0,
      },
      {
        bucket: 'very_old',
        label: 'Stale (180d+)',
        male: available.filter(p => {
          const d = Math.floor((now - new Date(p.entryDate || p.createdAt).getTime()) / 86400000);
          return p.gender === 'Male' && d > config.oldDays;
        }).length,
        female: available.filter(p => {
          const d = Math.floor((now - new Date(p.entryDate || p.createdAt).getTime()) / 86400000);
          return p.gender === 'Female' && d > config.oldDays;
        }).length,
        total: 0,
      },
    ].map(b => ({ ...b, total: b.male + b.female }));

    // City distribution
    const cityMap: Record<string, number> = {};
    available.forEach(p => {
      const city = p.city || 'Other';
      cityMap[city] = (cityMap[city] || 0) + 1;
    });
    const stockByCity = Object.entries(cityMap)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Caste distribution
    const casteMap: Record<string, number> = {};
    available.forEach(p => {
      const caste = p.caste || 'Other';
      casteMap[caste] = (casteMap[caste] || 0) + 1;
    });
    const stockByCaste = Object.entries(casteMap)
      .map(([caste, count]) => ({ caste, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Maslak distribution
    const maslakMap: Record<string, number> = {};
    available.forEach(p => {
      const m = p.maslak || 'Other';
      maslakMap[m] = (maslakMap[m] || 0) + 1;
    });
    const stockByMaslak = Object.entries(maslakMap)
      .map(([maslak, count]) => ({ maslak, count }))
      .sort((a, b) => b.count - a.count);

    // Financials
    const totalRevenue = this.invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const outstandingBalance = this.invoices
      .filter(inv => inv.status !== 'cancelled' && inv.status !== 'paid')
      .reduce((sum, inv) => sum + (inv.balance || 0), 0);

    // Engagement & Marriage stats
    const onHoldCount = this.profiles.filter(p => p.status === 'on_hold').length;
    const engagedCount = this.profiles.filter(p => p.status === 'engaged').length;
    const marriedCount = this.profiles.filter(p => p.status === 'married').length;
    const pendingRequestsCount = this.profiles.filter(p => p.status === 'pending_approval').length;
    const premiumProfilesCount = available.filter(p => p.isPremium || p.premiumMember).length;

    // Proposals
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const proposalsThisMonth = this.proposals.filter(pr => pr.createdAt >= thirtyDaysAgo).length;
    const finalizedRishtay = this.proposals.filter(pr => pr.status === 'finalized').length;

    return {
      totalStock: available.length,
      maleStock,
      femaleStock,
      newThisWeek,
      newThisMonth,
      agingStock,
      oldStock,
      veryOldStock,
      totalOldStock,
      onHoldCount,
      engagedCount,
      marriedCount,
      pendingRequestsCount,
      premiumProfilesCount,
      proposalsThisMonth,
      finalizedRishtay,
      totalRevenue,
      outstandingBalance,
      stockByAgeBucket,
      stockByCity,
      stockByCaste,
      stockByMaslak,
    };
  }

  public getOldStockProfiles(minDays: number = 91): { profile: Profile; daysInStock: number; matchCount: number }[] {
    const available = this.getActiveProfiles();
    const now = Date.now();
    const result: { profile: Profile; daysInStock: number; matchCount: number }[] = [];

    available.forEach(p => {
      const entryTime = new Date(p.entryDate || p.createdAt).getTime();
      const days = Math.max(0, Math.floor((now - entryTime) / 86400000));
      if (days >= minDays) {
        const matches = this.getMatchesForProfile(p.id);
        result.push({
          profile: p,
          daysInStock: days,
          matchCount: matches.length,
        });
      }
    });

    return result.sort((a, b) => b.daysInStock - a.daysInStock);
  }

  public bulkUpdateStatus(ids: string[], status: ProfileStatus, reason?: string): number {
    let count = 0;
    const now = new Date().toISOString();
    this.profiles = this.profiles.map(p => {
      if (ids.includes(p.id)) {
        count++;
        return {
          ...p,
          status,
          rejectionReason: status === 'rejected' ? reason : p.rejectionReason,
          lastActivityAt: now,
          updatedAt: now,
        };
      }
      return p;
    });
    this.save(STORAGE_KEYS.PROFILES, this.profiles);
    this.logAudit({
      action: 'status_change',
      entity: 'rishta',
      entityId: `bulk-${Date.now()}`,
      details: `Bulk updated status of ${count} profiles to ${status}`,
    });
    return count;
  }

  public bulkDelete(ids: string[]): number {
    const before = this.profiles.length;
    this.profiles = this.profiles.filter(p => !ids.includes(p.id));
    const deletedCount = before - this.profiles.length;
    this.save(STORAGE_KEYS.PROFILES, this.profiles);
    this.logAudit({
      action: 'delete',
      entity: 'rishta',
      entityId: `bulk-del-${Date.now()}`,
      details: `Bulk deleted ${deletedCount} profiles from inventory`,
    });
    return deletedCount;
  }

  public importProfiles(imported: Partial<Profile>[]): { added: number; skipped: number } {
    let added = 0;
    let skipped = 0;
    const now = new Date().toISOString();

    imported.forEach(item => {
      if (item.phone && this.checkDuplicatePhone(item.phone)) {
        skipped++;
        return;
      }
      const formNo = item.formNo || this.getNextFormNo();
      const id = item.id || `prof-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const profile: Profile = {
        name: item.name || 'Unknown',
        gender: (item.gender as any) || 'Female',
        age: Number(item.age) || 25,
        height: item.height || "5'4\"",
        caste: item.caste || 'Other',
        maslak: (item.maslak as any) || 'Sunni / Hanafi',
        educationLevel: (item.educationLevel as any) || 'Bachelors',
        degree: item.degree || (item.educationLevel as any) || 'Bachelors',
        educationDetail: item.educationDetail || '',
        profession: item.profession || 'Self',
        monthlyIncome: Number(item.monthlyIncome) || 0,
        city: item.city || 'Lahore',
        societyName: item.societyName || item.area || '',
        area: item.area || '',
        maritalStatus: (item.maritalStatus as any) || 'Never Married',
        religion: (item.religion as any) || 'Islam',
        fatherName: item.fatherName || 'Guardian',
        fatherOccupation: item.fatherOccupation || 'Business',
        motherName: item.motherName || 'Mother',
        motherOccupation: item.motherOccupation || 'Homemaker',
        totalSiblings: item.totalSiblings || 2,
        brothersCount: item.brothersCount || 1,
        sistersCount: item.sistersCount || 1,
        marriedSiblingsCount: item.marriedSiblingsCount || 0,
        familyDetails: item.familyDetails,
        preferences: item.preferences || { ageMin: 22, ageMax: 30, heightMin: "5'2\"", heightMax: "6'0\"", cities: ['Lahore'], educationMin: 'Bachelors', maritalStatuses: ['Never Married'], castes: ['Any'], maslak: 'Any / No Preference', minIncome: 50000 },
        phone: item.phone || '+92 300 0000000',
        whatsapp: item.whatsapp || item.phone || '+92 300 0000000',
        address: item.address || item.city || 'Lahore',
        contactPerson: item.contactPerson || item.name || 'Guardian',
        isPremium: Boolean(item.isPremium || item.premiumMember),
        premiumMember: Boolean(item.isPremium || item.premiumMember),
        status: (item.status as any) || 'available',
        notes: item.notes || '',
        remarks: item.remarks || '',
        id,
        formNo,
        entryDate: item.entryDate || now.split('T')[0],
        dateApplied: item.dateApplied || item.entryDate || now.split('T')[0],
        appliedBy: item.appliedBy || 'Bureau Staff',
        lastActivityAt: item.lastActivityAt || now,
        createdAt: item.createdAt || now,
        updatedAt: now,
      };
      this.profiles.unshift(profile);
      added++;
    });

    if (added > 0) {
      this.save(STORAGE_KEYS.PROFILES, this.profiles);
      this.logAudit({
        action: 'create',
        entity: 'rishta',
        entityId: `import-${Date.now()}`,
        details: `Imported ${added} profiles via CSV/Excel (${skipped} skipped as duplicates)`,
      });
    }

    return { added, skipped };
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
    const formNo = (profileData.formNo && profileData.formNo.trim()) ? profileData.formNo.trim() : this.getNextFormNo();
    const id = `prof-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const todayDate = nowIso.split('T')[0];
    const newProfile: Profile = {
      ...profileData,
      id,
      formNo,
      entryDate: profileData.entryDate || todayDate,
      dateApplied: profileData.dateApplied || profileData.entryDate || todayDate,
      appliedBy: profileData.appliedBy || 'Bureau Staff',
      lastActivityAt: profileData.lastActivityAt || nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    this.profiles.unshift(newProfile);
    this.save(STORAGE_KEYS.PROFILES, this.profiles);

    this.logAudit({
      action: 'create',
      entity: 'rishta',
      entityId: id,
      details: `Created profile ${formNo} (${newProfile.name})`,
    });

    return newProfile;
  }

  public updateProfile(id: string, updates: Partial<Profile>): Profile | null {
    const idx = this.profiles.findIndex(p => p.id === id);
    if (idx === -1) return null;

    const old = this.profiles[idx];
    const nowIso = new Date().toISOString();
    const updated: Profile = {
      ...old,
      ...updates,
      lastActivityAt: nowIso,
      updatedAt: nowIso,
    };

    this.profiles[idx] = updated;
    this.save(STORAGE_KEYS.PROFILES, this.profiles);

    this.logAudit({
      action: 'edit',
      entity: 'rishta',
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

    const resolvedFormNo = data.formNo || (data.profileId ? this.getProfileById(data.profileId)?.formNo : undefined);

    const newInvoice: Invoice = {
      ...data,
      formNo: resolvedFormNo,
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
      formNo: billedProfile?.formNo,
      clientName: billedProfile ? billedProfile.name : prop.profileAName,
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

  // Clear all bureau data (fresh start)
  public resetToDefaults() {
    this.profiles = [];
    this.settings = { ...INITIAL_SETTINGS };
    this.invoices = [];
    this.proposals = [];
    this.auditLogs = [];
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.PROFILES);
      localStorage.removeItem(STORAGE_KEYS.INVOICES);
      localStorage.removeItem(STORAGE_KEYS.PROPOSALS);
      localStorage.removeItem(STORAGE_KEYS.AUDIT);
      localStorage.removeItem('kmb_profiles_v1');
      localStorage.removeItem('kmb_invoices_v1');
      localStorage.removeItem('kmb_proposals_v1');
      localStorage.removeItem('kmb_audit_v1');
    }
    this.notify();
  }
}

// Singleton export
export const store = new DataStore();

