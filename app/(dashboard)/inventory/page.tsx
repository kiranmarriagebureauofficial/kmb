'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { store } from '@/lib/db/store';
import { useLanguage } from '@/lib/useLanguage';
import { 
  Profile, 
  Gender, 
  MaritalStatus, 
  EducationLevel, 
  Maslak, 
  StockStatus, 
  AgeBucket 
} from '@/lib/types';
import { 
  formatPKR, 
  formatDate, 
  formatDateTime, 
  calculateDaysInStock, 
  getAgeBucket, 
  getAgeBucketLabel,
  maskCNIC
} from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { exportRishtayPDF, exportSingleProfilePDF, filterProfilesByDateRange } from '@/lib/pdf-export';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Upload, 
  Eye, 
  Star, 
  MapPin, 
  Trash2, 
  Edit, 
  ArrowUpDown, 
  Sparkles, 
  X, 
  Phone, 
  Clock, 
  Calendar, 
  CheckSquare, 
  Square, 
  SlidersHorizontal,
  ChevronRight,
  HeartHandshake,
  MessageCircle,
  FileText
} from 'lucide-react';
import { 
  COMMON_CASTES, 
  COMMON_CITIES, 
  GENDER_OPTIONS, 
  MARITAL_STATUS_OPTIONS, 
  EDUCATION_LEVEL_OPTIONS 
} from '@/lib/i18n';

function InventoryContent() {
  const { tr, isUr } = useLanguage();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialBucket = (searchParams.get('bucket') as AgeBucket) || 'all';

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Filters
  const [selectedBucket, setSelectedBucket] = useState<string>(initialBucket);
  const [filterGender, setFilterGender] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('available');
  const [filterCity, setFilterCity] = useState<string>('All');
  const [filterCaste, setFilterCaste] = useState<string>('All');
  const [filterMaslak, setFilterMaslak] = useState<string>('All');
  const [filterEducation, setFilterEducation] = useState<string>('All');
  const [filterPremiumOnly, setFilterPremiumOnly] = useState<boolean>(false);
  const [filterHasMatchesOnly, setFilterHasMatchesOnly] = useState<boolean>(false);

  // Selection & Bulk Actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<StockStatus>('available');

  // Detail Drawer
  const [activeDrawerProfile, setActiveDrawerProfile] = useState<Profile | null>(null);

  // PDF Export Modal (All or Custom Date Range with Male/Female split)
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfMode, setPdfMode] = useState<'all' | 'range'>('all');
  const [pdfFromDate, setPdfFromDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [pdfToDate, setPdfToDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const pdfPreviewList = useMemo(() => {
    const baseList = pdfMode === 'range'
      ? filterProfilesByDateRange(profiles, pdfFromDate, pdfToDate)
      : profiles;
    return {
      all: baseList,
      male: baseList.filter(p => p.gender === 'Male'),
      female: baseList.filter(p => p.gender === 'Female'),
    };
  }, [profiles, pdfMode, pdfFromDate, pdfToDate]);

  const handleDownloadDirectoryPDF = async () => {
    setIsExportingPdf(true);
    try {
      await exportRishtayPDF(profiles, {
        fromDate: pdfMode === 'range' ? pdfFromDate : undefined,
        toDate: pdfMode === 'range' ? pdfToDate : undefined,
        title: pdfMode === 'range' ? 'Rishta Inventory (Date Range Report)' : 'Complete Rishta Inventory',
        bureauSettings: store.getSettings(),
      });
      setShowPdfModal(false);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Column Visibility
  const [visibleColumns, setVisibleColumns] = useState({
    formNo: true,
    daysInStock: true,
    candidate: true,
    ageHeight: true,
    maritalStatus: true,
    location: true,
    educationJob: true,
    income: true,
    casteMaslak: true,
    status: true,
    matches: true,
    lastActivity: true,
    actions: true,
  });
  const [showColumnChooser, setShowColumnChooser] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<'daysInStock' | 'name' | 'entryDate' | 'income'>('daysInStock');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const update = () => {
      setProfiles(store.getProfiles());
      setCurrentUser(store.getCurrentUser());
    };
    update();
    const unsub = store.subscribe(update);
    return unsub;
  }, []);

  const isAdmin = currentUser?.role === 'admin';
  const canAddEdit = isAdmin || currentUser?.permissions?.canAddEditData !== false;
  const canPrint = isAdmin || currentUser?.permissions?.canPrintExport !== false;

  // Compute profile matches count map
  const matchCounts = useMemo(() => {
    const map: Record<string, number> = {};
    profiles.forEach(p => {
      if (p.status === 'available' || (p.status as any) === 'active') {
        map[p.id] = store.getMatchesForProfile(p.id).length;
      } else {
        map[p.id] = 0;
      }
    });
    return map;
  }, [profiles]);

  // Filtered profiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      // Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesQuery =
          p.name.toLowerCase().includes(q) ||
          p.formNo.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.caste.toLowerCase().includes(q) ||
          p.profession.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Age Bucket
      if (selectedBucket !== 'all') {
        const days = calculateDaysInStock(p.entryDate || p.createdAt);
        const bucket = getAgeBucket(days);
        if (bucket !== selectedBucket) return false;
      }

      // Gender
      if (filterGender !== 'All' && p.gender !== filterGender) return false;

      // Status
      if (filterStatus !== 'All') {
        if (filterStatus === 'available') {
          if (p.status !== 'available' && (p.status as any) !== 'active') return false;
        } else if (p.status !== filterStatus) {
          return false;
        }
      }

      // City
      if (filterCity !== 'All' && p.city.toLowerCase() !== filterCity.toLowerCase()) return false;

      // Caste
      if (filterCaste !== 'All' && p.caste.toLowerCase() !== filterCaste.toLowerCase()) return false;

      // Maslak
      if (filterMaslak !== 'All' && p.maslak !== filterMaslak) return false;

      // Education
      if (filterEducation !== 'All' && p.educationLevel !== filterEducation) return false;

      // Premium Only
      if (filterPremiumOnly && !p.isPremium && !p.premiumMember) return false;

      // Has Matches Only
      if (filterHasMatchesOnly && (matchCounts[p.id] || 0) === 0) return false;

      return true;
    }).sort((a, b) => {
      const daysA = calculateDaysInStock(a.entryDate || a.createdAt);
      const daysB = calculateDaysInStock(b.entryDate || b.createdAt);

      if (sortField === 'daysInStock') {
        return sortOrder === 'desc' ? daysB - daysA : daysA - daysB;
      }
      if (sortField === 'income') {
        return sortOrder === 'desc' ? (b.monthlyIncome || 0) - (a.monthlyIncome || 0) : (a.monthlyIncome || 0) - (b.monthlyIncome || 0);
      }
      if (sortField === 'entryDate') {
        const timeA = new Date(a.entryDate || a.createdAt).getTime();
        const timeB = new Date(b.entryDate || b.createdAt).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      }
      if (sortField === 'name') {
        return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      return 0;
    });
  }, [
    profiles,
    searchTerm,
    selectedBucket,
    filterGender,
    filterStatus,
    filterCity,
    filterCaste,
    filterMaslak,
    filterEducation,
    filterPremiumOnly,
    filterHasMatchesOnly,
    sortField,
    sortOrder,
    matchCounts,
  ]);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredProfiles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProfiles.map(p => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Bulk actions
  const applyBulkStatus = () => {
    if (selectedIds.length === 0) return;
    store.bulkUpdateStatus(selectedIds, bulkStatus);
    setSelectedIds([]);
  };

  const applyBulkDelete = () => {
    if (!isAdmin || selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.length} profiles from inventory?`)) {
      store.bulkDelete(selectedIds);
      setSelectedIds([]);
    }
  };

  const exportSelectedCSV = () => {
    const listToExport = selectedIds.length > 0 
      ? profiles.filter(p => selectedIds.includes(p.id)) 
      : filteredProfiles;

    const headers = [
      'Form No', 'Entry Date', 'Days In Stock', 'Name', 'Gender', 'Age', 'Height', 
      'City', 'Marital Status', 'Education', 'Profession', 'Monthly Income (PKR)', 
      'Caste', 'Maslak', 'Status', 'Premium', 'Phone', 'Guardian Phone'
    ];

    const rows = listToExport.map(p => {
      const days = calculateDaysInStock(p.entryDate || p.createdAt);
      return [
        `"${p.formNo}"`,
        `"${p.entryDate || p.createdAt.split('T')[0]}"`,
        days,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.gender}"`,
        p.age,
        `"${p.height}"`,
        `"${p.city}"`,
        `"${p.maritalStatus}"`,
        `"${p.educationLevel}"`,
        `"${(p.profession || '').replace(/"/g, '""')}"`,
        p.monthlyIncome || 0,
        `"${p.caste}"`,
        `"${p.maslak}"`,
        `"${p.status}"`,
        p.isPremium || p.premiumMember ? 'Yes' : 'No',
        `"${p.phone}"`,
        `"${p.guardianPhone || ''}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kiran_marriage_bureau_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status badge styling
  const renderStatusBadge = (status: StockStatus) => {
    switch (status) {
      case 'available':
      case 'active' as any:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/20 text-[#800F2F] border border-[#D4AF37]/50">
            {tr('Available', 'دستیاب')}
          </span>
        );
      case 'on_hold':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F8F5F0] text-[#6E6466] border border-[#E5DFD5]">
            {tr('On Hold', 'ہولڈ پر')}
          </span>
        );
      case 'engaged':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#800F2F] text-[#F8F5F0]">
            {tr('Engaged', 'منگنی شدہ')}
          </span>
        );
      case 'married':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#660A22] text-[#D4AF37] border border-[#D4AF37]">
            {tr('Married', 'شادی شدہ')}
          </span>
        );
      case 'pending_approval':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFFFFF] text-[#B88B22] border border-[#D4AF37]">
            {tr('Pending Approval', 'زیرِ التواء منظوری')}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#A3182E]/10 text-[#A3182E] border border-[#A3182E]/30">
            {tr('Rejected', 'مسترد')}
          </span>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Stats Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFFFF] p-4 rounded-xl border border-[#E5DFD5] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-serif font-bold tracking-widest text-[#B88B22]">
              {tr('Stock Ledger & Profiles', 'اسٹاک لیجر اور کوائف')}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#800F2F] text-[#F8F5F0] font-bold">
              {filteredProfiles.length} {tr('in view', 'موجود')}
            </span>
          </div>
          <h1 className="font-serif text-xl font-bold text-[#800F2F] mt-0.5">
            {tr('Rishta Stock Inventory', 'رشتہ اسٹاک انوینٹری')}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canPrint && (
            <>
              <Button
                size="sm"
                variant="accent"
                onClick={() => setShowPdfModal(true)}
                icon={<FileText className="w-3.5 h-3.5 text-[#800F2F]" />}
              >
                {tr('Download PDF', 'پی ڈی ایف ڈاؤنلوڈ')}
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={exportSelectedCSV}
                icon={<Download className="w-3.5 h-3.5 text-[#800F2F]" />}
              >
                {tr('Export CSV', 'سی ایس وی ایکسپورٹ')}
              </Button>
            </>
          )}

          {canAddEdit && (
            <>
              <Link href="/import-export">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Upload className="w-3.5 h-3.5 text-[#800F2F]" />}
                >
                  {tr('Import CSV', 'سی ایس وی امپورٹ')}
                </Button>
              </Link>

              <Link href="/profiles/new">
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Plus className="w-3.5 h-3.5 text-[#D4AF37]" />}
                >
                  {tr('Add New Rishta', 'نیا رشتہ درج کریں')}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Age Bucket Quick Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-[#6E6466] shrink-0 me-1 uppercase">
          {tr('Age in Stock:', 'اسٹاک کی مدت:')}
        </span>
        {[
          { key: 'all', label: tr('All Stock', 'تمام اسٹاک') },
          { key: 'new', label: tr('New (0-7d)', 'نئے (0-7 دن)') },
          { key: 'recent', label: tr('Recent (8-30d)', 'حالیہ (8-30 دن)') },
          { key: 'aging', label: tr('Aging (31-90d)', 'درمیانی (31-90 دن)') },
          { key: 'old', label: tr('Old Stock (91-180d)', 'پرانے (91-180 دن)') },
          { key: 'very_old', label: tr('Stale (180d+)', 'انتہائی پرانے (+180 دن)') },
        ].map(b => (
          <button
            key={b.key}
            onClick={() => setSelectedBucket(b.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
              selectedBucket === b.key
                ? 'bg-[#800F2F] text-[#F8F5F0] border-[#800F2F] shadow-xs'
                : 'bg-[#FFFFFF] text-[#800F2F] border-[#E5DFD5] hover:border-[#D4AF37]'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E5DFD5] space-y-3 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
          {/* Search bar */}
          <div className="col-span-1 sm:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-[#6E6466] absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={tr('Search by Form No, Name, Phone, Caste, City...', 'فارم نمبر، نام، فون، ذات یا شہر سے تلاش کریں...')}
              className="w-full ps-8 pe-3 py-1.5 rounded-lg bg-[#F8F5F0] border border-[#E5DFD5] text-xs text-[#2C2526] focus:border-[#D4AF37] focus:outline-none placeholder-[#6E6466]"
            />
          </div>

          {/* Gender */}
          <div>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F5F0] border border-[#E5DFD5] text-xs text-[#2C2526] focus:outline-none"
            >
              <option value="All">{tr('All Genders', 'تمام اصناف')}</option>
              <option value="Male">{tr('Male Candidates', 'مرد امیدوار')}</option>
              <option value="Female">{tr('Female Candidates', 'خواتین امیدوار')}</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F5F0] border border-[#E5DFD5] text-xs text-[#2C2526] focus:outline-none"
            >
              <option value="All">{tr('All Statuses', 'تمام حیثیتیں')}</option>
              <option value="available">{tr('Available (In Stock)', 'دستیاب')}</option>
              <option value="on_hold">{tr('On Hold', 'ہولڈ پر')}</option>
              <option value="engaged">{tr('Engaged', 'منگنی شدہ')}</option>
              <option value="married">{tr('Married', 'شادی شدہ')}</option>
              <option value="pending_approval">{tr('Pending Approval', 'زیرِ التواء منظوری')}</option>
              <option value="rejected">{tr('Rejected', 'مسترد')}</option>
            </select>
          </div>

          {/* City */}
          <div>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F5F0] border border-[#E5DFD5] text-xs text-[#2C2526] focus:outline-none"
            >
              <option value="All">{tr('All Cities', 'تمام شہر')}</option>
              {COMMON_CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Caste */}
          <div>
            <select
              value={filterCaste}
              onChange={(e) => setFilterCaste(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F5F0] border border-[#E5DFD5] text-xs text-[#2C2526] focus:outline-none"
            >
              <option value="All">{tr('All Castes', 'تمام ذاتیں')}</option>
              {COMMON_CASTES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Filters & Toggles */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-1 border-t border-[#E5DFD5]/60 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-1.5 cursor-pointer text-[#800F2F] font-medium">
              <input
                type="checkbox"
                checked={filterPremiumOnly}
                onChange={(e) => setFilterPremiumOnly(e.target.checked)}
                className="rounded accent-[#D4AF37]"
              />
              <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
              <span>{tr('Premium Rishtay Only', 'صرف پریمیم رشتے')}</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[#800F2F] font-medium">
              <input
                type="checkbox"
                checked={filterHasMatchesOnly}
                onChange={(e) => setFilterHasMatchesOnly(e.target.checked)}
                className="rounded accent-[#800F2F]"
              />
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              <span>{tr('Has Matches Available', 'جن کے میچز موجود ہوں')}</span>
            </label>

            {/* Clear filters */}
            {(searchTerm || selectedBucket !== 'all' || filterGender !== 'All' || filterStatus !== 'available' || filterCity !== 'All' || filterCaste !== 'All' || filterPremiumOnly || filterHasMatchesOnly) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBucket('all');
                  setFilterGender('All');
                  setFilterStatus('available');
                  setFilterCity('All');
                  setFilterCaste('All');
                  setFilterPremiumOnly(false);
                  setFilterHasMatchesOnly(false);
                }}
                className="text-[#A3182E] hover:underline font-semibold flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>{tr('Reset Filters', 'فلٹرز صاف کریں')}</span>
              </button>
            )}
          </div>

          {/* Sort & Column Chooser */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] text-[#6E6466]">
              <span>{tr('Sort:', 'ترتیب:')}</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="bg-[#F8F5F0] border border-[#E5DFD5] px-2 py-0.5 rounded text-[11px] text-[#2C2526]"
              >
                <option value="daysInStock">{tr('Days in Stock', 'اسٹاک کے دن')}</option>
                <option value="entryDate">{tr('Entry Date', 'تاریخ اندراج')}</option>
                <option value="name">{tr('Name', 'نام')}</option>
                <option value="income">{tr('Income', 'آمدنی')}</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-1 rounded hover:bg-[#F8F5F0] text-[#800F2F]"
                title={tr('Toggle sort direction', 'ترتیب بدلیں')}
              >
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={() => setShowColumnChooser(!showColumnChooser)}
              className="p-1 rounded border border-[#E5DFD5] hover:border-[#D4AF37] text-[#800F2F] flex items-center gap-1 text-[11px] px-2"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>{tr('Columns', 'کالمز')}</span>
            </button>
          </div>
        </div>

        {/* Column chooser popup */}
        {showColumnChooser && (
          <div className="p-3 bg-[#F8F5F0] border border-[#E5DFD5] rounded-lg flex items-center gap-4 flex-wrap text-xs text-[#2C2526]">
            <span className="font-bold text-[#800F2F]">{tr('Visible Columns:', 'ظاہر کالمز:')}</span>
            {Object.keys(visibleColumns).map(col => {
              const colLabels: Record<string, [string, string]> = {
                formNo: ['Form No', 'فارم نمبر'],
                name: ['Name', 'نام'],
                gender: ['Gender', 'جنس'],
                age: ['Age', 'عمر'],
                city: ['City', 'شہر'],
                caste: ['Caste', 'ذات'],
                maslak: ['Maslak', 'مسلک'],
                education: ['Education', 'تعلیم'],
                profession: ['Profession', 'پیشہ'],
                income: ['Income', 'آمدنی'],
                status: ['Status', 'اسٹیٹس'],
                daysInStock: ['Days In Stock', 'دن اسٹاک میں'],
                matches: ['Matches', 'میچز'],
                actions: ['Actions', 'کارروائی'],
              };
              const pair = colLabels[col];
              return (
                <label key={col} className="flex items-center gap-1 cursor-pointer capitalize">
                  <input
                    type="checkbox"
                    checked={(visibleColumns as any)[col]}
                    onChange={(e) => setVisibleColumns(prev => ({ ...prev, [col]: e.target.checked }))}
                    className="rounded accent-[#800F2F]"
                  />
                  <span>{pair ? tr(pair[0], pair[1]) : col.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="p-2.5 bg-[#800F2F] text-[#F8F5F0] rounded-xl flex items-center justify-between gap-4 text-xs shadow-md">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#D4AF37]">
              {tr(`${selectedIds.length} profiles selected`, `${selectedIds.length} پروفائلز منتخب`)}
            </span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-[#E5DFD5] hover:underline"
            >
              {tr('Deselect All', 'سب ختم کریں')}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#E5DFD5]">{tr('Change Status:', 'اسٹیٹس تبدیل کریں:')}</span>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as StockStatus)}
              className="px-2 py-1 rounded bg-[#660A22] text-[#F8F5F0] border border-[#D4AF37] text-xs"
            >
              <option value="available">{tr('Available', 'دستیاب')}</option>
              <option value="on_hold">{tr('On Hold', 'روکا گیا')}</option>
              <option value="engaged">{tr('Engaged', 'منگنی شدہ')}</option>
              <option value="married">{tr('Married', 'شادی شدہ')}</option>
              <option value="rejected">{tr('Rejected', 'مسترد')}</option>
            </select>
            <Button size="sm" variant="accent" onClick={applyBulkStatus}>
              {tr('Apply', 'لاگو کریں')}
            </Button>

            <Button size="sm" variant="secondary" onClick={exportSelectedCSV}>
              {tr('Export Selected', 'منتخب ایکسپورٹ')}
            </Button>

            {isAdmin && (
              <Button size="sm" variant="danger" onClick={applyBulkDelete}>
                {tr('Delete', 'حذف کریں')}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* High Density Data Table */}
      <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-xl shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#800F2F] text-[#F8F5F0] border-b border-[#660A22] sticky top-0 z-10 text-[11px] tracking-wider uppercase font-semibold">
              <th className="p-2.5 text-center w-8">
                <button
                  onClick={handleSelectAll}
                  className="hover:text-[#D4AF37]"
                  title="Select All"
                >
                  {selectedIds.length === filteredProfiles.length && filteredProfiles.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
                  ) : (
                    <Square className="w-4 h-4 text-[#E5DFD5]" />
                  )}
                </button>
              </th>
              {visibleColumns.formNo && <th className="p-2.5">{tr('Register / Form No', 'رجسٹر / فارم نمبر')}</th>}
              {visibleColumns.daysInStock && <th className="p-2.5">{tr('Stock Age', 'اسٹاک مدت')}</th>}
              {visibleColumns.candidate && <th className="p-2.5">{tr('Candidate', 'امیدوار')}</th>}
              {visibleColumns.ageHeight && <th className="p-2.5">{tr('Age / Height', 'عمر / قد')}</th>}
              {visibleColumns.maritalStatus && <th className="p-2.5">{tr('Marital Status', 'ازدواجی حیثیت')}</th>}
              {visibleColumns.location && <th className="p-2.5">{tr('City / Area', 'شہر / علاقہ')}</th>}
              {visibleColumns.educationJob && <th className="p-2.5">{tr('Education & Job', 'تعلیم و پیشہ')}</th>}
              {visibleColumns.income && <th className="p-2.5">{tr('Monthly Income', 'ماہانہ آمدنی')}</th>}
              {visibleColumns.casteMaslak && <th className="p-2.5">{tr('Caste / Maslak', 'ذات / مسلک')}</th>}
              {visibleColumns.status && <th className="p-2.5">{tr('Status', 'حیثیت')}</th>}
              {visibleColumns.matches && <th className="p-2.5 text-center">{tr('Matches', 'میچز')}</th>}
              {visibleColumns.lastActivity && <th className="p-2.5">{tr('Last Activity', 'آخری سرگرمی')}</th>}
              {visibleColumns.actions && <th className="p-2.5 text-end">{tr('Actions', 'اعمال')}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5DFD5]/60">
            {filteredProfiles.length === 0 ? (
              <tr>
                <td colSpan={14} className="p-8 text-center text-xs text-[#6E6466]">
                  {tr('No rishtas found matching the selected inventory criteria.', 'منتخب کردہ شرائط کے مطابق کوئی رشتہ موجود نہیں۔')}
                </td>
              </tr>
            ) : (
              filteredProfiles.map((p, idx) => {
                const isSelected = selectedIds.includes(p.id);
                const daysInStock = calculateDaysInStock(p.entryDate || p.createdAt);
                const bucket = getAgeBucket(daysInStock);
                const bucketInfo = getAgeBucketLabel(bucket);
                const countMatches = matchCounts[p.id] || 0;

                return (
                  <tr
                    key={p.id}
                    className={`transition-colors hover:bg-[#F8F5F0] cursor-pointer ${
                      idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#FAF7F2]'
                    } ${isSelected ? 'bg-[#D4AF37]/15' : ''}`}
                    onClick={() => setActiveDrawerProfile(p)}
                  >
                    {/* Checkbox */}
                    <td 
                      className="p-2.5 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectOne(p.id);
                      }}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#800F2F]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#6E6466]" />
                      )}
                    </td>

                    {/* Form No */}
                    {visibleColumns.formNo && (
                      <td className="p-2.5 font-serif font-bold text-[#800F2F] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{p.formNo}</span>
                          {(p.isPremium || p.premiumMember) && (
                            <span title={tr('Premium Member', 'پریمیم ممبر')}>
                              <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                            </span>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Stock Age & Bucket */}
                    {visibleColumns.daysInStock && (
                      <td className="p-2.5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] ${bucketInfo.badgeClass}`}>
                            {daysInStock}{tr('d', ' دن')} • {isUr ? bucketInfo.textUr : bucketInfo.label}
                          </span>
                          <span className="text-[9px] text-[#6E6466] mt-0.5">
                            {formatDate(p.entryDate || p.createdAt)}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Candidate Name & Gender */}
                    {visibleColumns.candidate && (
                      <td className="p-2.5">
                        <div className="flex items-center gap-2">
                          <ProfileAvatar
                            name={p.name}
                            photoUrl={p.photoUrl}
                            size="xs"
                            isPremium={Boolean(p.isPremium || p.premiumMember)}
                          />
                          <div className="font-semibold text-[#2C2526] flex items-center gap-1">
                            <span>{p.name}</span>
                            <span className={`text-[10px] px-1 rounded ${p.gender === 'Male' ? 'bg-[#800F2F]/10 text-[#800F2F]' : 'bg-[#D4AF37]/20 text-[#800F2F]'}`}>
                              {p.gender === 'Male' ? tr('M', 'لڑکا') : tr('F', 'لڑکی')}
                            </span>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Age / Height */}
                    {visibleColumns.ageHeight && (
                      <td className="p-2.5 whitespace-nowrap text-[#6E6466]">
                        {p.age} {tr('yrs', 'سال')} • {p.height}
                      </td>
                    )}

                    {/* Marital Status */}
                    {visibleColumns.maritalStatus && (
                      <td className="p-2.5 whitespace-nowrap text-[#2C2526]">
                        {p.maritalStatus}
                      </td>
                    )}

                    {/* Location */}
                    {visibleColumns.location && (
                      <td className="p-2.5 whitespace-nowrap text-[#6E6466]">
                        <span className="font-medium text-[#2C2526]">{p.city}</span>
                        {p.area && <span className="text-[10px] text-[#6E6466] block">{p.area}</span>}
                      </td>
                    )}

                    {/* Education & Job */}
                    {visibleColumns.educationJob && (
                      <td className="p-2.5">
                        <span className="font-medium text-[#2C2526] block truncate max-w-[140px]" title={p.profession}>
                          {p.profession || 'Not specified'}
                        </span>
                        <span className="text-[10px] text-[#6E6466] block">
                          {p.educationLevel}
                        </span>
                      </td>
                    )}

                    {/* Monthly Income */}
                    {visibleColumns.income && (
                      <td className="p-2.5 whitespace-nowrap font-medium text-[#800F2F]">
                        {formatPKR(p.monthlyIncome || 0)}
                      </td>
                    )}

                    {/* Caste & Maslak */}
                    {visibleColumns.casteMaslak && (
                      <td className="p-2.5 whitespace-nowrap">
                        <span className="font-semibold text-[#2C2526] block">{p.caste}</span>
                        <span className="text-[10px] text-[#6E6466] block truncate max-w-[110px]" title={p.maslak}>
                          {p.maslak}
                        </span>
                      </td>
                    )}

                    {/* Status */}
                    {visibleColumns.status && (
                      <td className="p-2.5 whitespace-nowrap">
                        {renderStatusBadge(p.status as StockStatus)}
                      </td>
                    )}

                    {/* Matches count */}
                    {visibleColumns.matches && (
                      <td className="p-2.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {(p.status === 'available' || (p.status as any) === 'active') ? (
                          <Link
                            href={`/profiles/${p.id}/matches`}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold transition-transform hover:scale-105 ${
                              countMatches > 0
                                ? 'bg-[#800F2F] text-[#D4AF37]'
                                : 'bg-[#E5DFD5] text-[#6E6466]'
                            }`}
                            title="Click to view full match compatibility details"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{countMatches}</span>
                          </Link>
                        ) : (
                          <span className="text-[10px] text-[#6E6466]">-</span>
                        )}
                      </td>
                    )}

                    {/* Last Activity */}
                    {visibleColumns.lastActivity && (
                      <td className="p-2.5 whitespace-nowrap text-[10px] text-[#6E6466]">
                        {p.lastActivityAt ? formatDate(p.lastActivityAt) : formatDate(p.updatedAt || p.createdAt)}
                      </td>
                    )}

                    {/* Actions */}
                    {visibleColumns.actions && (
                      <td className="p-2.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setActiveDrawerProfile(p)}
                            className="p-1 rounded hover:bg-[#E5DFD5] text-[#800F2F]"
                            title="Open Detail Drawer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <Link
                            href={`/profiles/${p.id}/edit`}
                            className="p-1 rounded hover:bg-[#E5DFD5] text-[#800F2F]"
                            title="Edit Profile"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          {(p.status === 'available' || (p.status as any) === 'active') && (
                            <Link
                              href={`/profiles/${p.id}/matches`}
                              className="p-1 rounded hover:bg-[#E5DFD5] text-[#B88B22]"
                              title="Compatibility Matches"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-out Quick Detail Drawer */}
      {activeDrawerProfile && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-end"
          onClick={() => setActiveDrawerProfile(null)}
        >
          <div 
            className="w-full max-w-lg bg-[#FFFFFF] h-full shadow-2xl border-s border-[#E5DFD5] flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="bg-[#800F2F] text-[#F8F5F0] p-4 flex items-center justify-between border-b border-[#D4AF37]">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-[#D4AF37]">
                  {activeDrawerProfile.formNo}
                </span>
                {renderStatusBadge(activeDrawerProfile.status as StockStatus)}
                {(activeDrawerProfile.isPremium || activeDrawerProfile.premiumMember) && (
                  <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                )}
              </div>
              <button
                onClick={() => setActiveDrawerProfile(null)}
                className="p-1 rounded text-[#E5DFD5] hover:text-[#D4AF37]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-[#2C2526]">
              {/* Profile Main Overview */}
              <div className="p-4 bg-[#F8F5F0] rounded-xl border border-[#E5DFD5] space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar
                      name={activeDrawerProfile.name}
                      photoUrl={activeDrawerProfile.photoUrl}
                      size="lg"
                      isPremium={Boolean(activeDrawerProfile.isPremium || activeDrawerProfile.premiumMember)}
                    />
                    <div>
                      <h2 className="font-serif text-xl font-bold text-[#800F2F]">
                        {activeDrawerProfile.name}
                      </h2>
                      <p className="text-[#6E6466] text-xs">
                        {activeDrawerProfile.gender === 'Male' ? tr('Male', 'مرد') : tr('Female', 'خاتون')} • {activeDrawerProfile.age} {tr('yrs', 'سال')} • {activeDrawerProfile.height} • {activeDrawerProfile.maritalStatus}
                      </p>
                    </div>
                  </div>
                  <div className="text-end shrink-0">
                    <span className="text-[10px] text-[#6E6466] block">{tr('Days in Stock:', 'اسٹاک میں دن:')}</span>
                    <span className="font-bold text-[#800F2F] text-sm">
                      {calculateDaysInStock(activeDrawerProfile.entryDate || activeDrawerProfile.createdAt)} {tr('days', 'دن')}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5DFD5] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#6E6466] block text-[10px]">{tr('Caste & Maslak', 'ذات اور مسلک')}</span>
                    <span className="font-semibold">{activeDrawerProfile.caste} ({activeDrawerProfile.maslak})</span>
                  </div>
                  <div>
                    <span className="text-[#6E6466] block text-[10px]">{tr('City & Area', 'شہر اور علاقہ')}</span>
                    <span className="font-semibold">{activeDrawerProfile.city} {activeDrawerProfile.area ? `(${activeDrawerProfile.area})` : ''}</span>
                  </div>
                  <div>
                    <span className="text-[#6E6466] block text-[10px]">{tr('Education', 'تعلیم')}</span>
                    <span className="font-semibold">{activeDrawerProfile.educationLevel}</span>
                  </div>
                  <div>
                    <span className="text-[#6E6466] block text-[10px]">{tr('Monthly Income', 'ماہانہ آمدنی')}</span>
                    <span className="font-semibold text-[#800F2F]">{formatPKR(activeDrawerProfile.monthlyIncome || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Private Staff Contact Info (Confidential) */}
              <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#D4AF37]/40 space-y-2">
                <div className="flex items-center gap-1.5 text-[#800F2F] font-bold">
                  <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{tr('Confidential Client Contact (Staff Only)', 'کلائنٹ کا خفیہ رابطہ (صرف عملہ)')}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#6E6466] text-[10px] block">{tr('Candidate Phone', 'امیدوار کا فون')}</span>
                    <a href={`tel:${activeDrawerProfile.phone}`} className="font-bold text-[#800F2F] hover:underline" dir="ltr">
                      {activeDrawerProfile.phone}
                    </a>
                  </div>
                  {activeDrawerProfile.guardianPhone && (
                    <div>
                      <span className="text-[#6E6466] text-[10px] block">{tr('Guardian Phone', 'سرپرست کا فون')}</span>
                      <a href={`tel:${activeDrawerProfile.guardianPhone}`} className="font-bold text-[#800F2F] hover:underline" dir="ltr">
                        {activeDrawerProfile.guardianPhone}
                      </a>
                    </div>
                  )}
                  {activeDrawerProfile.cnic && (
                    <div>
                      <span className="text-[#6E6466] text-[10px] block">{tr('CNIC', 'شناختی کارڈ')}</span>
                      <span dir="ltr">{maskCNIC(activeDrawerProfile.cnic)}</span>
                    </div>
                  )}
                  {activeDrawerProfile.address && (
                    <div>
                      <span className="text-[#6E6466] text-[10px] block">{tr('Residential Address', 'رہائشی پتہ')}</span>
                      <span className="truncate block" title={activeDrawerProfile.address}>{activeDrawerProfile.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Partner Preferences */}
              <div className="p-3 bg-[#F8F5F0] rounded-xl border border-[#E5DFD5] space-y-1.5">
                <span className="font-serif font-bold text-[#800F2F] block">
                  {tr('Partner Preferences', 'شریک حیات کی ترجیحات')}
                </span>
                <p className="text-xs text-[#6E6466]">
                  {tr('Age:', 'عمر:')} {activeDrawerProfile.preferences.ageMin} - {activeDrawerProfile.preferences.ageMax} {tr('yrs', 'سال')} • {tr('Height:', 'قد:')} {activeDrawerProfile.preferences.heightMin} - {activeDrawerProfile.preferences.heightMax}
                </p>
                <p className="text-xs text-[#6E6466]">
                  {tr('Cities:', 'شہر:')} {activeDrawerProfile.preferences.cities.join(', ')} • {tr('Castes:', 'ذات:')} {activeDrawerProfile.preferences.castes.join(', ')}
                </p>
                <p className="text-xs text-[#6E6466]">
                  {tr('Min Education:', 'کم از کم تعلیم:')} {activeDrawerProfile.preferences.educationMin} • {tr('Min Income:', 'کم از کم آمدنی:')} {formatPKR(activeDrawerProfile.preferences.minIncome || 0)}
                </p>
              </div>

              {/* Status Switcher in Drawer */}
              <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5DFD5] space-y-2">
                <span className="font-bold text-[#800F2F] block text-xs">
                  {tr('Change Inventory Status:', 'اسٹاک اسٹیٹس تبدیل کریں:')}
                </span>
                <div className="flex items-center gap-2">
                  <select
                    defaultValue={activeDrawerProfile.status}
                    onChange={(e) => {
                      store.updateProfileStatus(activeDrawerProfile.id, e.target.value as StockStatus);
                      setActiveDrawerProfile({
                        ...activeDrawerProfile,
                        status: e.target.value as StockStatus,
                      });
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#F8F5F0] border border-[#E5DFD5] text-xs font-semibold text-[#800F2F]"
                  >
                    <option value="available">{tr('Available (In Stock)', 'دستیاب (اسٹاک میں)')}</option>
                    <option value="on_hold">{tr('On Hold', 'روکا گیا')}</option>
                    <option value="engaged">{tr('Engaged', 'منگنی شدہ')}</option>
                    <option value="married">{tr('Married', 'شادی شدہ')}</option>
                    <option value="rejected">{tr('Rejected', 'مسترد')}</option>
                  </select>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href={`/profiles/${activeDrawerProfile.id}/matches`}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#800F2F] text-[#F8F5F0] font-bold text-xs hover:bg-[#660A22] transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{tr('View Compatibility Matches', 'موزوں رشتے دیکھیں')}</span>
                </Link>

                <Link
                  href={`/profiles/${activeDrawerProfile.id}/edit`}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#FFFFFF] text-[#800F2F] border border-[#800F2F] font-bold text-xs hover:bg-[#F8F5F0] transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{tr('Edit Full Profile', 'مکمل پروفائل ایڈٹ کریں')}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => exportSingleProfilePDF(activeDrawerProfile, store.getSettings())}
                  className="col-span-2 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#D4AF37] text-[#800F2F] font-bold text-xs hover:bg-[#C09B2A] transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{tr('Download Biodata PDF', 'بائیوڈیٹا پی ڈی ایف ڈاؤنلوڈ کریں')} ({activeDrawerProfile.formNo})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Export Modal with All vs Custom Date Range & Separate Male/Female Preview */}
      {showPdfModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setShowPdfModal(false)}
        >
          <div
            className="bg-[#FFFFFF] border border-[#D4AF37] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#800F2F] text-[#F8F5F0] px-5 py-4 flex items-center justify-between border-b border-[#D4AF37]">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#D4AF37]">
                  {tr('Download Rishtay PDF Directory', 'رشتوں کی پی ڈی ایف فہرست ڈاؤنلوڈ کریں')}
                </h2>
                <p className="text-[11px] text-[#E5DFD5]">
                  {tr('Exports all matching rishtas with separate Male & Female sections, Real Names, Photos & Register Numbers', 'منتخب رشتوں کی پی ڈی ایف الگ مرد و خواتین سیکشن، اصل نام، تصویر اور رجسٹر نمبر کے ساتھ ڈاؤنلوڈ کریں')}
                </p>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                className="p-1 text-[#E5DFD5] hover:text-[#D4AF37]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Mode Toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPdfMode('all')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold border transition-colors ${
                    pdfMode === 'all'
                      ? 'bg-[#800F2F] text-[#F8F5F0] border-[#800F2F]'
                      : 'bg-[#F8F5F0] text-[#800F2F] border-[#E5DFD5]'
                  }`}
                >
                  {tr(`All Rishtay (${profiles.length})`, `تمام رشتے (${profiles.length})`)}
                </button>
                <button
                  type="button"
                  onClick={() => setPdfMode('range')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold border transition-colors ${
                    pdfMode === 'range'
                      ? 'bg-[#800F2F] text-[#F8F5F0] border-[#800F2F]'
                      : 'bg-[#F8F5F0] text-[#800F2F] border-[#E5DFD5]'
                  }`}
                >
                  {tr('Custom Date Range (From – To)', 'مخصوص تاریخوں کے مطابق (سے – تک)')}
                </button>
              </div>

              {/* Date Pickers */}
              {pdfMode === 'range' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#F8F5F0] rounded-xl border border-[#E5DFD5]">
                  <div>
                    <label className="block text-[11px] font-bold text-[#800F2F] mb-1">
                      {tr('From Date', 'کس تاریخ سے')}
                    </label>
                    <input
                      type="date"
                      value={pdfFromDate}
                      onChange={(e) => setPdfFromDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E5DFD5] text-xs text-[#2C2526]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#800F2F] mb-1">
                      {tr('To Date', 'کس تاریخ تک')}
                    </label>
                    <input
                      type="date"
                      value={pdfToDate}
                      onChange={(e) => setPdfToDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E5DFD5] text-xs text-[#2C2526]"
                    />
                  </div>
                </div>
              )}

              {/* Separate Male / Female Live Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#F8F5F0] border border-[#E5DFD5]">
                  <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-1.5 mb-2">
                    <span className="font-serif font-bold text-[#800F2F]">
                      {tr('Section A: Male Rishtay', 'حصہ اول: مردانہ رشتے')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#800F2F] text-[#D4AF37] font-bold text-[10px]">
                      {pdfPreviewList.male.length}
                    </span>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {pdfPreviewList.male.length === 0 ? (
                      <p className="text-[11px] text-[#6E6466] italic">{tr('No male rishtay in range', 'ان تاریخوں میں کوئی مردانہ رشتہ نہیں')}</p>
                    ) : (
                      pdfPreviewList.male.map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-[11px] py-1 border-b border-[#E5DFD5]/50 last:border-0">
                          <span className="font-semibold text-[#2C2526] truncate">
                            <span className="text-[#800F2F] font-mono me-1.5">{p.formNo}</span>
                            {p.name}
                          </span>
                          <span className="text-[10px] text-[#6E6466] shrink-0">{p.entryDate || p.createdAt.split('T')[0]}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F5F0] border border-[#E5DFD5]">
                  <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-1.5 mb-2">
                    <span className="font-serif font-bold text-[#800F2F]">
                      {tr('Section B: Female Rishtay', 'حصہ دوم: خواتین کے رشتے')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#800F2F] font-bold text-[10px]">
                      {pdfPreviewList.female.length}
                    </span>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {pdfPreviewList.female.length === 0 ? (
                      <p className="text-[11px] text-[#6E6466] italic">{tr('No female rishtay in range', 'ان تاریخوں میں کوئی خاتون رشتہ نہیں')}</p>
                    ) : (
                      pdfPreviewList.female.map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-[11px] py-1 border-b border-[#E5DFD5]/50 last:border-0">
                          <span className="font-semibold text-[#2C2526] truncate">
                            <span className="text-[#800F2F] font-mono me-1.5">{p.formNo}</span>
                            {p.name}
                          </span>
                          <span className="text-[10px] text-[#6E6466] shrink-0">{p.entryDate || p.createdAt.split('T')[0]}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E5DFD5] flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#6E6466]">
                  {tr('Ready to export', 'ایکسپورٹ کے لیے تیار')}: <strong className="text-[#800F2F]">{pdfPreviewList.all.length}</strong> ({pdfPreviewList.male.length} {tr('Male', 'مرد')}, {pdfPreviewList.female.length} {tr('Female', 'خواتین')})
                </span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setShowPdfModal(false)}>
                    {tr('Cancel', 'منسوخ')}
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={isExportingPdf || pdfPreviewList.all.length === 0}
                    onClick={handleDownloadDirectoryPDF}
                    icon={<FileText className="w-3.5 h-3.5 text-[#D4AF37]" />}
                  >
                    {isExportingPdf ? tr('Generating PDF...', 'پی ڈی ایف تیار ہو رہی ہے...') : tr('Download PDF', 'پی ڈی ایف ڈاؤنلوڈ')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#6E6466]">Loading Rishta Inventory...</div>}>
      <InventoryContent />
    </Suspense>
  );
}

