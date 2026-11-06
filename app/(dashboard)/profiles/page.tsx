'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { store } from '@/lib/db/store';
import { Profile, Gender, MaritalStatus, EducationLevel, Maslak, ProfileStatus } from '@/lib/types';
import { formatPKR, formatDate } from '@/lib/utils';
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
  FileSpreadsheet,
  X
} from 'lucide-react';
import { COMMON_CASTES, COMMON_CITIES, GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, EDUCATION_LEVEL_OPTIONS } from '@/lib/i18n';

export default function ProfilesListPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Filters
  const [filterGender, setFilterGender] = useState<string>('All');
  const [filterCaste, setFilterCaste] = useState<string>('All');
  const [filterCity, setFilterCity] = useState<string>('All');
  const [filterEducation, setFilterEducation] = useState<string>('All');
  const [filterMaritalStatus, setFilterMaritalStatus] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [filterPremiumOnly, setFilterPremiumOnly] = useState<boolean>(false);

  // CSV Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importReport, setImportReport] = useState<string | null>(null);

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

  // Filtered & Searched Profiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      // Search text
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

      if (filterGender !== 'All' && p.gender !== filterGender) return false;
      if (filterCaste !== 'All' && p.caste.toLowerCase() !== filterCaste.toLowerCase()) return false;
      if (filterCity !== 'All' && p.city.toLowerCase() !== filterCity.toLowerCase()) return false;
      if (filterEducation !== 'All' && p.educationLevel !== filterEducation) return false;
      if (filterMaritalStatus !== 'All' && p.maritalStatus !== filterMaritalStatus) return false;
      if (filterStatus !== 'All' && p.status !== filterStatus) return false;
      if (filterPremiumOnly && !p.premiumMember) return false;

      return true;
    });
  }, [
    profiles,
    searchTerm,
    filterGender,
    filterCaste,
    filterCity,
    filterEducation,
    filterMaritalStatus,
    filterStatus,
    filterPremiumOnly,
  ]);

  // CSV Export (Admin only)
  const handleExportCSV = () => {
    if (!isAdmin) return;
    const headers = [
      'Form No',
      'Name',
      'Gender',
      'Age',
      'Height',
      'Marital Status',
      'City',
      'Degree',
      'Education Level',
      'Profession',
      'Monthly Income',
      'Caste',
      'Maslak',
      'Father Name',
      'Father Occupation',
      'Phone',
      'Status',
      'Premium Member',
    ];

    const rows = filteredProfiles.map(p => [
      `"${p.formNo}"`,
      `"${p.name}"`,
      `"${p.gender}"`,
      p.age,
      `"${p.height}"`,
      `"${p.maritalStatus}"`,
      `"${p.city}"`,
      `"${p.degree}"`,
      `"${p.educationLevel}"`,
      `"${p.profession}"`,
      p.monthlyIncome,
      `"${p.caste}"`,
      `"${p.maslak}"`,
      `"${p.fatherName}"`,
      `"${p.fatherOccupation}"`,
      `"${p.phone}"`,
      `"${p.status}"`,
      p.premiumMember ? 'Yes' : 'No',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kiran_marriage_bureau_profiles_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import parser
  const handleImportCSV = () => {
    if (!importText.trim()) return;
    try {
      const lines = importText.trim().split('\n');
      let importedCount = 0;
      let duplicateCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 6) {
          const name = parts[0] || 'Imported Candidate';
          const gender = (parts[1] === 'Female' ? 'Female' : 'Male') as Gender;
          const age = parseInt(parts[2], 10) || 27;
          const caste = parts[3] || 'Arain';
          const city = parts[4] || 'Lahore';
          const phone = parts[5] || '+92 300 0000000';

          const dup = store.checkDuplicatePhone(phone);
          if (dup) {
            duplicateCount++;
          } else {
            store.addProfile({
              appliedBy: 'CSV Import Tool',
              dateApplied: new Date().toISOString().split('T')[0],
              name,
              gender,
              age,
              maritalStatus: 'Never Married',
              height: "5'9\"",
              city,
              degree: 'Bachelors Degree',
              educationLevel: 'Bachelors',
              profession: 'Private Sector',
              monthlyIncome: 150000,
              fatherName: 'Father',
              fatherOccupation: 'Business',
              motherName: 'Mother',
              motherOccupation: 'Homemaker',
              totalSiblings: 2,
              brothersCount: 1,
              sistersCount: 1,
              marriedSiblingsCount: 0,
              religion: 'Islam',
              caste,
              maslak: 'Sunni / Hanafi',
              phone,
              whatsapp: phone,
              address: city,
              status: 'active',
              premiumMember: false,
              preferences: {
                ageMin: 22,
                ageMax: 30,
                heightMin: "5'2\"",
                heightMax: "6'0\"",
                cities: [city],
                educationMin: 'Bachelors',
                maritalStatuses: ['Never Married'],
                castes: [caste, 'Any'],
                maslak: 'Sunni / Hanafi',
                minIncome: 0,
              },
            });
            importedCount++;
          }
        }
      }

      setImportReport(`Import complete: ${importedCount} profile(s) imported successfully. ${duplicateCount} duplicates flagged/skipped.`);
      setTimeout(() => {
        setShowImportModal(false);
        setImportReport(null);
      }, 3000);
    } catch (e) {
      setImportReport('Error parsing CSV format. Please verify columns.');
    }
  };

  const handleDelete = (id: string, formNo: string) => {
    if (!isAdmin) {
      alert('Only administrators are authorized to delete client records.');
      return;
    }
    if (confirm(`Are you sure you want to permanently delete profile ${formNo}? This action cannot be undone.`)) {
      store.deleteProfile(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDF8] p-5 rounded-2xl border border-[#E9DDC3] shadow-sm">
        <div>
          <span className="text-[11px] uppercase font-serif font-bold tracking-widest text-[#B08626]">
            Bureau Directory
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#5A0A14] mt-0.5">
            Registered Rishta Profiles ({filteredProfiles.length})
          </h1>
          <p className="text-xs text-[#7B5E5E]">
            Filter candidates by caste, sect, education, and location.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/profiles/new">
            <Button size="sm" variant="primary" icon={<Plus className="w-3.5 h-3.5 text-[#D9A93F]" />}>
              Add New Rishta
            </Button>
          </Link>

          {isAdmin && (
            <>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleExportCSV}
                icon={<FileSpreadsheet className="w-3.5 h-3.5 text-[#5A0A14]" />}
                title="Export filtered list to Excel / CSV"
              >
                Export CSV
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowImportModal(true)}
                icon={<Upload className="w-3.5 h-3.5 text-[#5A0A14]" />}
                title="Migrate old register records via CSV"
              >
                Import CSV
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-[#FFFDF8] border border-[#E9DDC3] rounded-2xl p-5 shadow-sm space-y-4">
        {/* Search Input */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-[#7B5E5E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, form no (e.g. KMB-0001), caste, profession..."
              className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-[#FBF4E6] border border-[#E9DDC3] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
            />
          </div>

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-2 text-xs font-semibold text-[#8E1B2B] hover:bg-[#FBF4E6] rounded-lg"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-[#7B5E5E] mb-1">Gender</label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full p-1.5 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6]"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male (Grooms)</option>
              <option value="Female">Female (Brides)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#7B5E5E] mb-1">Caste / Qaum</label>
            <select
              value={filterCaste}
              onChange={(e) => setFilterCaste(e.target.value)}
              className="w-full p-1.5 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6]"
            >
              <option value="All">All Castes</option>
              {COMMON_CASTES.filter(c => c !== 'Any').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#7B5E5E] mb-1">City</label>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full p-1.5 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6]"
            >
              <option value="All">All Cities</option>
              {COMMON_CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#7B5E5E] mb-1">Education</label>
            <select
              value={filterEducation}
              onChange={(e) => setFilterEducation(e.target.value)}
              className="w-full p-1.5 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6]"
            >
              <option value="All">All Levels</option>
              {EDUCATION_LEVEL_OPTIONS.map(ed => (
                <option key={ed.value} value={ed.value}>{ed.labelEn}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#7B5E5E] mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-1.5 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6]"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active (In Matching)</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="engaged">Engaged</option>
              <option value="married">Married</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-[#5A0A14]">
              <input
                type="checkbox"
                checked={filterPremiumOnly}
                onChange={(e) => setFilterPremiumOnly(e.target.checked)}
                className="w-4 h-4 text-[#D9A93F] rounded border-[#E9DDC3]"
              />
              <span className="flex items-center gap-1 text-[11px]">
                <Star className="w-3 h-3 text-[#D9A93F] fill-[#D9A93F]" />
                <span>Premium Only</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Profiles Table View */}
      <div className="bg-[#FFFDF8] border border-[#E9DDC3] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#5A0A14] text-[#FBF4E6] uppercase font-serif tracking-wider">
              <tr>
                <th className="p-3.5">Form #</th>
                <th className="p-3.5">Candidate Details</th>
                <th className="p-3.5">Caste & Maslak</th>
                <th className="p-3.5">Education & Job</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DDC3]">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#7B5E5E]">
                    No profiles matched your filter parameters.
                  </td>
                </tr>
              ) : (
                filteredProfiles.map(p => (
                  <tr key={p.id} className="hover:bg-[#FBF4E6]/60 transition-colors">
                    {/* Form # */}
                    <td className="p-3.5 font-mono font-bold text-[#5A0A14] whitespace-nowrap">
                      {p.formNo}
                      {p.premiumMember && (
                        <Star className="w-3.5 h-3.5 fill-[#D9A93F] text-[#D9A93F] inline-block ml-1" />
                      )}
                    </td>

                    {/* Candidate */}
                    <td className="p-3.5">
                      <div className="font-bold text-[#2A0A0F] text-sm">{p.name}</div>
                      <div className="text-[11px] text-[#7B5E5E]">
                        {p.gender} • {p.age} Yrs • {p.height} • {p.maritalStatus}
                      </div>
                    </td>

                    {/* Caste & Maslak */}
                    <td className="p-3.5">
                      <div className="font-semibold text-[#5A0A14]">{p.caste}</div>
                      <div className="text-[11px] text-[#7B5E5E]">{p.maslak}</div>
                    </td>

                    {/* Education & Profession */}
                    <td className="p-3.5 max-w-[200px]">
                      <div className="font-semibold text-[#2A0A0F] truncate">{p.profession}</div>
                      <div className="text-[11px] text-[#7B5E5E] truncate">{p.degree}</div>
                    </td>

                    {/* City */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-[#2A0A0F]">
                        <MapPin className="w-3 h-3 text-[#D9A93F]" />
                        <span>{p.city}</span>
                      </div>
                      <div className="text-[10px] text-[#7B5E5E]">{p.societyName || 'Lahore'}</div>
                    </td>

                    {/* Status */}
                    <td className="p-3.5 whitespace-nowrap">
                      <Badge status={p.status} />
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/profiles/${p.id}/matches`}>
                          <button
                            className="p-1.5 rounded-lg bg-[#5A0A14] hover:bg-[#420610] text-[#D9A93F] text-[11px] font-semibold flex items-center gap-1 px-2"
                            title="Find & Compute Matches"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Matches</span>
                          </button>
                        </Link>

                        <Link href={`/profiles/${p.id}`}>
                          <button
                            className="p-1.5 rounded-lg bg-[#FFFDF8] border border-[#E9DDC3] hover:border-[#D9A93F] text-[#5A0A14]"
                            title="View Full Profile Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </Link>

                        <Link href={`/profiles/${p.id}/edit`}>
                          <button
                            className="p-1.5 rounded-lg bg-[#FFFDF8] border border-[#E9DDC3] hover:border-[#D9A93F] text-[#5A0A14]"
                            title="Edit Profile"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </Link>

                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(p.id, p.formNo)}
                            className="p-1.5 rounded-lg bg-[#FFFDF8] border border-[#8E1B2B]/30 hover:bg-[#8E1B2B] hover:text-white text-[#8E1B2B] transition-colors"
                            title="Delete Profile (Admin Only)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-[#2A0A0F]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] border border-[#E9DDC3] rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#E9DDC3] pb-3">
              <h3 className="font-serif text-base font-bold text-[#5A0A14]">
                Migrate Old Register Data (CSV Import)
              </h3>
              <button onClick={() => setShowImportModal(false)}>
                <X className="w-4 h-4 text-[#7B5E5E]" />
              </button>
            </div>

            <p className="text-[11px] text-[#7B5E5E]">
              Format: <code>Name, Gender, Age, Caste, City, Phone</code> (Header row is skipped automatically. Duplicate phones will be flagged).
            </p>

            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Name, Gender, Age, Caste, City, Phone&#10;Muhammad Rizwan, Male, 28, Arain, Lahore, 03001234567&#10;Hina Tariq, Female, 25, Rajput, Lahore, 03217654321"
              className="w-full p-3 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] font-mono text-[11px]"
            />

            {importReport && (
              <p className="text-xs font-semibold text-[#5A0A14] bg-[#FBF4E6] p-2 rounded border border-[#D9A93F]">
                {importReport}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E9DDC3]">
              <Button size="sm" variant="secondary" onClick={() => setShowImportModal(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleImportCSV}>
                Start Migration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
