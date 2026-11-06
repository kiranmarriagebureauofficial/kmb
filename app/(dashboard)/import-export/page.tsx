'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { store } from '@/lib/db/store';
import { Profile } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Database, 
  AlertCircle, 
  CheckCircle, 
  FileCheck, 
  Save, 
  RefreshCw,
  Copy,
  Table
} from 'lucide-react';

function ImportExportContent() {
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<Partial<Profile>[]>([]);
  const [duplicateCount, setDuplicateCount] = useState<number>(0);
  const [importResult, setImportResult] = useState<{ added: number; skipped: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Parse CSV
  const handleParseCsv = (rawText: string) => {
    setCsvText(rawText);
    if (!rawText.trim()) {
      setParsedRows([]);
      setDuplicateCount(0);
      return;
    }

    try {
      const lines = rawText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
      const rows: Partial<Profile>[] = [];
      let dupes = 0;

      for (let i = 1; i < lines.length; i++) {
        // Simple regex split respecting quotes
        const match = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));

        const rowObj: any = {};
        headers.forEach((h, idx) => {
          const val = values[idx] || '';
          if (h.includes('name')) rowObj.name = val;
          else if (h.includes('gender')) rowObj.gender = val === 'M' || val.toLowerCase() === 'male' ? 'Male' : 'Female';
          else if (h.includes('age')) rowObj.age = parseInt(val, 10) || 25;
          else if (h.includes('height')) rowObj.height = val || "5'6\"";
          else if (h.includes('caste')) rowObj.caste = val || 'Other';
          else if (h.includes('maslak') || h.includes('sect')) rowObj.maslak = val || 'Sunni / Hanafi';
          else if (h.includes('city')) rowObj.city = val || 'Lahore';
          else if (h.includes('profession') || h.includes('job')) rowObj.profession = val || 'Self';
          else if (h.includes('income')) rowObj.monthlyIncome = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
          else if (h.includes('phone') || h.includes('contact') || h.includes('mobile')) rowObj.phone = val;
          else if (h.includes('marital')) rowObj.maritalStatus = val || 'Never Married';
          else if (h.includes('education')) rowObj.educationLevel = val || 'Bachelors';
        });

        if (rowObj.phone && store.checkDuplicatePhone(rowObj.phone)) {
          dupes++;
        }
        rows.push(rowObj);
      }

      setParsedRows(rows);
      setDuplicateCount(dupes);
    } catch (e) {
      console.error('CSV Parsing error:', e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleParseCsv(text);
    };
    reader.readAsText(file);
  };

  const executeImport = () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      const result = store.importProfiles(parsedRows);
      setImportResult(result);
      setParsedRows([]);
      setCsvText('');
      setIsProcessing(false);
    }, 400);
  };

  // Sample CSV template
  const downloadSampleTemplate = () => {
    const sample = `Name,Gender,Age,Height,City,Caste,Maslak,Education,Profession,Monthly Income,Marital Status,Phone
Muhammad Usman,Male,29,5'11",Lahore,Arain,Sunni / Hanafi,Masters,Software Engineer,250000,Never Married,+923001234567
Zainab Bibi,Female,26,5'4",Lahore,Rajput,Sunni / Hanafi,Bachelors,Lecturer,80000,Never Married,+923219876543`;
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'kiran_marriage_bureau_sample_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Full backup JSON
  const downloadFullBackupJSON = () => {
    const data = {
      backupDate: new Date().toISOString(),
      profiles: store.getProfiles(),
      invoices: store.getInvoices(),
      proposals: store.getProposals(),
      settings: store.getSettings(),
      staff: store.getStaff(),
      auditLogs: store.getAuditLogs(),
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kiran_bureau_full_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Warning: Restoring from a backup file will merge or overwrite current records. Proceed?')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.profiles && Array.isArray(json.profiles)) {
          store.importProfiles(json.profiles);
          alert(`Backup restored successfully! ${json.profiles.length} profiles processed.`);
        }
      } catch (err) {
        alert('Invalid JSON backup file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="bg-[#FFFDF8] p-5 rounded-xl border border-[#E9DDC3] shadow-sm">
        <span className="text-[10px] uppercase font-serif font-bold tracking-widest text-[#B08626]">
          Data Migration & Disaster Recovery
        </span>
        <h1 className="font-serif text-2xl font-bold text-[#5A0A14] mt-0.5">
          Import / Export & Backup Manager
        </h1>
        <p className="text-xs text-[#7B5E5E]">
          Bulk migrate legacy rishta spreadsheets into the ERP system, scan duplicate phone numbers, or download an encrypted system backup.
        </p>
      </div>

      {importResult && (
        <div className="p-4 bg-[#D9A93F]/20 border border-[#D9A93F] rounded-xl flex items-center justify-between text-xs text-[#5A0A14]">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle className="w-5 h-5 text-[#D9A93F]" />
            <span>Import Completed: {importResult.added} new rishtas added to stock!</span>
          </div>
          {importResult.skipped > 0 && (
            <span className="text-[#8E1B2B] font-semibold">
              ({importResult.skipped} duplicate phone numbers were skipped)
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: CSV Bulk Importer */}
        <div className="bg-[#FFFDF8] p-6 rounded-xl border border-[#E9DDC3] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#5A0A14]" />
                <h2 className="font-serif text-lg font-bold text-[#5A0A14]">
                  Bulk CSV / Excel Importer
                </h2>
              </div>
              <button
                onClick={downloadSampleTemplate}
                className="text-xs font-semibold text-[#5A0A14] hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample Template</span>
              </button>
            </div>

            <p className="text-xs text-[#7B5E5E]">
              Upload a .csv file or paste tabular data with columns: Name, Gender, Age, Height, City, Caste, Maslak, Education, Profession, Income, Phone.
            </p>

            <div className="p-4 bg-[#FBF4E6] border border-dashed border-[#D9A93F] rounded-xl text-center space-y-2">
              <Upload className="w-6 h-6 text-[#5A0A14] mx-auto" />
              <label className="inline-block cursor-pointer px-4 py-1.5 rounded-lg bg-[#5A0A14] text-[#FBF4E6] text-xs font-semibold hover:bg-[#420610]">
                <span>Choose CSV File</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-[#7B5E5E] block">or paste CSV text directly below:</span>
            </div>

            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => handleParseCsv(e.target.value)}
              placeholder="Name,Gender,Age,Height,City,Caste,Maslak,Education,Profession,Monthly Income,Marital Status,Phone..."
              className="w-full p-2.5 rounded-lg bg-[#FBF4E6] border border-[#E9DDC3] text-xs font-mono text-[#2A0A0F] focus:outline-none"
            />

            {/* Parsed summary preview */}
            {parsedRows.length > 0 && (
              <div className="p-3 bg-[#FFFDF8] border border-[#E9DDC3] rounded-lg space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-[#5A0A14]">Parsed Records: {parsedRows.length} candidates</span>
                  {duplicateCount > 0 ? (
                    <span className="text-[#8E1B2B] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {duplicateCount} duplicate phones detected!
                    </span>
                  ) : (
                    <span className="text-[#5A0A14] flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5 text-[#D9A93F]" />
                      Zero duplicates
                    </span>
                  )}
                </div>

                <div className="max-h-32 overflow-y-auto divide-y divide-[#E9DDC3] text-[11px]">
                  {parsedRows.slice(0, 5).map((r, i) => (
                    <div key={i} className="py-1 flex items-center justify-between">
                      <span className="font-semibold text-[#2A0A0F]">{r.name} ({r.gender}, {r.age}y, {r.caste})</span>
                      <span className="text-[#7B5E5E]">{r.phone}</span>
                    </div>
                  ))}
                  {parsedRows.length > 5 && (
                    <div className="py-1 text-[#7B5E5E] text-center italic">
                      + {parsedRows.length - 5} more records...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#E9DDC3]">
            <Button
              size="md"
              variant="primary"
              disabled={parsedRows.length === 0 || isProcessing}
              onClick={executeImport}
              className="w-full"
              icon={<Upload className="w-4 h-4 text-[#D9A93F]" />}
            >
              {isProcessing ? 'Importing Stock...' : `Commit Import (${parsedRows.length} Profiles)`}
            </Button>
          </div>
        </div>

        {/* Module 2: System Backup & Full Export */}
        <div className="bg-[#FFFDF8] p-6 rounded-xl border border-[#E9DDC3] shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#5A0A14]" />
              <h2 className="font-serif text-lg font-bold text-[#5A0A14]">
                Bureau Backup & Data Archival
              </h2>
            </div>

            <p className="text-xs text-[#7B5E5E]">
              Generate complete offline archives of all bureau operations. Full backups include profiles, proposals, invoices, settings, and the immutable audit ledger.
            </p>

            {/* Quick Export Cards */}
            <div className="space-y-2.5">
              <div className="p-3.5 bg-[#FBF4E6] rounded-xl border border-[#E9DDC3] flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#5A0A14] block">Full System Backup (JSON)</span>
                  <span className="text-[11px] text-[#7B5E5E]">Profiles, invoices, proposals, settings, staff</span>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={downloadFullBackupJSON}
                  icon={<Download className="w-3.5 h-3.5 text-[#D9A93F]" />}
                >
                  Download JSON
                </Button>
              </div>

              <div className="p-3.5 bg-[#FBF4E6] rounded-xl border border-[#E9DDC3] flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#5A0A14] block">Restore from Backup (JSON)</span>
                  <span className="text-[11px] text-[#7B5E5E]">Upload previously saved system backup file</span>
                </div>
                <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-[#FFFDF8] text-[#5A0A14] border border-[#5A0A14] text-xs font-semibold hover:bg-[#FAF6EC]">
                  <span>Upload Backup</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleRestoreBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#D9A93F]/15 rounded-lg border border-[#D9A93F]/40 text-[11px] text-[#5A0A14] space-y-1">
            <span className="font-bold block">★ Security & Privacy Notice:</span>
            <p>Exported backups contain unmasked client contact information and CNIC details. Store backups in secure, encrypted storage only.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ImportExportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#7B5E5E]">Loading Import/Export...</div>}>
      <ImportExportContent />
    </Suspense>
  );
}

