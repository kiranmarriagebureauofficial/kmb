'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { store } from '@/lib/db/store';
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
            Available
          </span>
        );
      case 'on_hold':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F8F5F0] text-[#6E6466] border border-[#E5DFD5]">
            On Hold
          </span>
        );
      case 'engaged':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#800F2F] text-[#F8F5F0]">
            Engaged
          </span>
        );
      case 'married':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#660A22] text-[#D4AF37] border border-[#D4AF37]">
            Married
          </span>
        );
      case 'pending_approval':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FFFFFF] text-[#B88B22] border border-[#D4AF37]">
            Pending Approval
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#A3182E]/10 text-[#A3182E] border border-[#A3182E]/30">
            Rejected
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
              Stock Ledger & Profiles
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#800F2F] text-[#F8F5F0] font-bold">
              {filteredProfiles.length} in view
            </span>
          </div>
          <h1 className="font-serif text-xl font-bold text-[#800F2F] mt-0.5">
            Rishta Stock Inventory
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="secondary"
            onClick={exportSelectedCSV}
            icon={<Download className="w-3.5 h-3.5 text-[#800F2F]" />}
          >
            Export CSV
          </Button>

          <Link href="/import-export">
            <Button
              size="sm"
              variant="secondary"
              icon={<Upload className="w-3.5 h-3.5 text-[#800F2F]" />}
            >
              Import CSV
            </Button>
          </Link>

          <Link href="/profiles/new">
            <Button
              size="sm"
              variant="primary"
              icon={<Plus className="w-3.5 h-3.5 text-[#D4AF37]" />}
            >
              Add New Rishta
            </Button>
          </Link>
        </div>
      </div>

      {/* Age Bucket Quick Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-[#6E6466] shrink-0 mr-1 uppercase">
          Age in Stock:
        </span>
        {[
          { key: 'all', label: 'All Stock' },
          { key: 'new', label: 'New (0-7d)' },
          { key: 'recent', label: 'Recent (8-30d)' },
          { key: 'aging', label: 'Aging (31-90d)' },
          { key: 'old', label: 'Old Stock (91-180d)' },
          { key: 'very_old', label: 'Stale (180d+)' },
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
            <Search className="w-3.5 h-3.5 text-[#6E6466] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Form No, Name, Phone, Caste, City..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#F8F5F0] border border-[#E5DFD5] text-xs text-[#2C2526] focus:border-[#D4AF37] focus:outline-none placeholder-[#6E6466]"
            />
          </div>

          {/* Gender */}
          <div>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F5F0] border border-[#E5DFD5] text-xs text-[#2C2526] focus:outline-none"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male Candidates</option>
              <option value="Female">Female Candidates</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F5F0] border border-[#E5DFD5] text-xs text-[#2C2526] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="available">Available (In Stock)</option>
              <option value="on_hold">On Hold</option>
              <option value="engaged">Engaged</option>
              <option value="married">Married</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* City */}
          <div>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#F8F5F0] border border-[#E5DFD5] text-xs text-[#2C2526] focus:outline-none"
            >
              <option value="All">All Cities</option>
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
              <option value="All">All Castes</option>
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
              <span>Premium Rishtay Only</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-[#800F2F] font-medium">
              <input
                type="checkbox"
                checked={filterHasMatchesOnly}
                onChange={(e) => setFilterHasMatchesOnly(e.target.checked)}
                className="rounded accent-[#800F2F]"
              />
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              <span>Has Matches Available</span>
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
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Sort & Column Chooser */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] text-[#6E6466]">
              <span>Sort:</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
                className="bg-[#F8F5F0] border border-[#E5DFD5] px-2 py-0.5 rounded text-[11px] text-[#2C2526]"
              >
                <option value="daysInStock">Days in Stock</option>
                <option value="entryDate">Entry Date</option>
                <option value="name">Name</option>
                <option value="income">Income</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-1 rounded hover:bg-[#F8F5F0] text-[#800F2F]"
                title="Toggle sort direction"
              >
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={() => setShowColumnChooser(!showColumnChooser)}
              className="p-1 rounded border border-[#E5DFD5] hover:border-[#D4AF37] text-[#800F2F] flex items-center gap-1 text-[11px] px-2"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Columns</span>
            </button>
          </div>
        </div>

        {/* Column chooser popup */}
        {showColumnChooser && (
          <div className="p-3 bg-[#F8F5F0] border border-[#E5DFD5] rounded-lg flex items-center gap-4 flex-wrap text-xs text-[#2C2526]">
            <span className="font-bold text-[#800F2F]">Visible Columns:</span>
            {Object.keys(visibleColumns).map(col => (
              <label key={col} className="flex items-center gap-1 cursor-pointer capitalize">
                <input
                  type="checkbox"
                  checked={(visibleColumns as any)[col]}
                  onChange={(e) => setVisibleColumns(prev => ({ ...prev, [col]: e.target.checked }))}
                  className="rounded accent-[#800F2F]"
                />
                <span>{col.replace(/([A-Z])/g, ' $1')}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="p-2.5 bg-[#800F2F] text-[#F8F5F0] rounded-xl flex items-center justify-between gap-4 text-xs shadow-md">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#D4AF37]">{selectedIds.length} profiles selected</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-[#E5DFD5] hover:underline"
            >
              Deselect All
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#E5DFD5]">Change Status:</span>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value as StockStatus)}
              className="px-2 py-1 rounded bg-[#660A22] text-[#F8F5F0] border border-[#D4AF37] text-xs"
            >
              <option value="available">Available</option>
              <option value="on_hold">On Hold</option>
              <option value="engaged">Engaged</option>
              <option value="married">Married</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button size="sm" variant="accent" onClick={applyBulkStatus}>
              Apply
            </Button>

            <Button size="sm" variant="secondary" onClick={exportSelectedCSV}>
              Export Selected
            </Button>

            {isAdmin && (
              <Button size="sm" variant="danger" onClick={applyBulkDelete}>
                Delete
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
              {visibleColumns.formNo && <th className="p-2.5">Form No</th>}
              {visibleColumns.daysInStock && <th className="p-2.5">Stock Age</th>}
              {visibleColumns.candidate && <th className="p-2.5">Candidate</th>}
              {visibleColumns.ageHeight && <th className="p-2.5">Age / Height</th>}
              {visibleColumns.maritalStatus && <th className="p-2.5">Marital Status</th>}
              {visibleColumns.location && <th className="p-2.5">City / Area</th>}
              {visibleColumns.educationJob && <th className="p-2.5">Education & Job</th>}
              {visibleColumns.income && <th className="p-2.5">Monthly Income</th>}
              {visibleColumns.casteMaslak && <th className="p-2.5">Caste / Maslak</th>}
              {visibleColumns.status && <th className="p-2.5">Status</th>}
              {visibleColumns.matches && <th className="p-2.5 text-center">Matches</th>}
              {visibleColumns.lastActivity && <th className="p-2.5">Last Activity</th>}
              {visibleColumns.actions && <th className="p-2.5 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5DFD5]/60">
            {filteredProfiles.length === 0 ? (
              <tr>
                <td colSpan={14} className="p-8 text-center text-xs text-[#6E6466]">
                  No rishtas found matching the selected inventory criteria.
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
                            <span title="Premium Member">
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
                            {daysInStock}d • {bucketInfo.label}
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
                        <div className="font-semibold text-[#2C2526] flex items-center gap-1">
                          <span>{p.name}</span>
                          <span className={`text-[10px] px-1 rounded ${p.gender === 'Male' ? 'bg-[#800F2F]/10 text-[#800F2F]' : 'bg-[#D4AF37]/20 text-[#800F2F]'}`}>
                            {p.gender === 'Male' ? 'M' : 'F'}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Age / Height */}
                    {visibleColumns.ageHeight && (
                      <td className="p-2.5 whitespace-nowrap text-[#6E6466]">
                        {p.age} yrs • {p.height}
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
            className="w-full max-w-lg bg-[#FFFFFF] h-full shadow-2xl border-l border-[#E5DFD5] flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
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
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[#800F2F]">
                      {activeDrawerProfile.name}
                    </h2>
                    <p className="text-[#6E6466] text-xs">
                      {activeDrawerProfile.gender} • {activeDrawerProfile.age} yrs • {activeDrawerProfile.height} • {activeDrawerProfile.maritalStatus}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#6E6466] block">Days in Stock:</span>
                    <span className="font-bold text-[#800F2F] text-sm">
                      {calculateDaysInStock(activeDrawerProfile.entryDate || activeDrawerProfile.createdAt)} days
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5DFD5] grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#6E6466] block text-[10px]">Caste & Maslak</span>
                    <span className="font-semibold">{activeDrawerProfile.caste} ({activeDrawerProfile.maslak})</span>
                  </div>
                  <div>
                    <span className="text-[#6E6466] block text-[10px]">City & Area</span>
                    <span className="font-semibold">{activeDrawerProfile.city} {activeDrawerProfile.area ? `(${activeDrawerProfile.area})` : ''}</span>
                  </div>
                  <div>
                    <span className="text-[#6E6466] block text-[10px]">Education</span>
                    <span className="font-semibold">{activeDrawerProfile.educationLevel}</span>
                  </div>
                  <div>
                    <span className="text-[#6E6466] block text-[10px]">Monthly Income</span>
                    <span className="font-semibold text-[#800F2F]">{formatPKR(activeDrawerProfile.monthlyIncome || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Private Staff Contact Info (Confidential) */}
              <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#D4AF37]/40 space-y-2">
                <div className="flex items-center gap-1.5 text-[#800F2F] font-bold">
                  <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Confidential Client Contact (Staff Only)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#6E6466] text-[10px] block">Candidate Phone</span>
                    <a href={`tel:${activeDrawerProfile.phone}`} className="font-bold text-[#800F2F] hover:underline">
                      {activeDrawerProfile.phone}
                    </a>
                  </div>
                  {activeDrawerProfile.guardianPhone && (
                    <div>
                      <span className="text-[#6E6466] text-[10px] block">Guardian Phone</span>
                      <a href={`tel:${activeDrawerProfile.guardianPhone}`} className="font-bold text-[#800F2F] hover:underline">
                        {activeDrawerProfile.guardianPhone}
                      </a>
                    </div>
                  )}
                  {activeDrawerProfile.cnic && (
                    <div>
                      <span className="text-[#6E6466] text-[10px] block">CNIC</span>
                      <span>{maskCNIC(activeDrawerProfile.cnic)}</span>
                    </div>
                  )}
                  {activeDrawerProfile.address && (
                    <div>
                      <span className="text-[#6E6466] text-[10px] block">Residential Address</span>
                      <span className="truncate block" title={activeDrawerProfile.address}>{activeDrawerProfile.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Partner Preferences */}
              <div className="p-3 bg-[#F8F5F0] rounded-xl border border-[#E5DFD5] space-y-1.5">
                <span className="font-serif font-bold text-[#800F2F] block">
                  Partner Preferences
                </span>
                <p className="text-xs text-[#6E6466]">
                  Age: {activeDrawerProfile.preferences.ageMin} - {activeDrawerProfile.preferences.ageMax} yrs • Height: {activeDrawerProfile.preferences.heightMin} - {activeDrawerProfile.preferences.heightMax}
                </p>
                <p className="text-xs text-[#6E6466]">
                  Cities: {activeDrawerProfile.preferences.cities.join(', ')} • Castes: {activeDrawerProfile.preferences.castes.join(', ')}
                </p>
                <p className="text-xs text-[#6E6466]">
                  Min Education: {activeDrawerProfile.preferences.educationMin} • Min Income: {formatPKR(activeDrawerProfile.preferences.minIncome || 0)}
                </p>
              </div>

              {/* Status Switcher in Drawer */}
              <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5DFD5] space-y-2">
                <span className="font-bold text-[#800F2F] block text-xs">
                  Change Inventory Status:
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
                    <option value="available">Available (In Stock)</option>
                    <option value="on_hold">On Hold</option>
                    <option value="engaged">Engaged</option>
                    <option value="married">Married</option>
                    <option value="rejected">Rejected</option>
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
                  <span>View Compatibility Matches</span>
                </Link>

                <Link
                  href={`/profiles/${activeDrawerProfile.id}/edit`}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#FFFFFF] text-[#800F2F] border border-[#800F2F] font-bold text-xs hover:bg-[#F8F5F0] transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Full Profile</span>
                </Link>
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

