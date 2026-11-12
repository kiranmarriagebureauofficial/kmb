'use client';

import React from 'react';
import Image from 'next/image';
import { Profile, MatchResult } from '@/lib/types';
import { MatchRing } from '../ui/MatchRing';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { X, Printer, Check, ArrowLeftRight, Star } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

interface ProfileComparisonModalProps {
  profileA: Profile;
  profileB: Profile;
  match: MatchResult;
  onClose: () => void;
}

export function ProfileComparisonModal({
  profileA,
  profileB,
  match,
  onClose,
}: ProfileComparisonModalProps) {
  const { tr, isUr } = useLanguage();
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2C2526]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header (No-print) */}
        <div className="no-print p-4 bg-[#800F2F] text-[#F8F5F0] flex items-center justify-between border-b border-[#D4AF37] shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-serif text-base font-bold tracking-wide">
              {tr('Side-by-Side Rishta Comparison & Compatibility Audit', 'آمنے سامنے رشتہ موازنہ اور مطابقت کا جائزہ')}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="accent"
              onClick={handlePrint}
              icon={<Printer className="w-4 h-4 text-[#660A22]" />}
            >
              {tr('Print Comparison Sheet', 'موازنہ شیٹ پرنٹ کریں')}
            </Button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[#660A22] text-[#E5DFD5] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Content */}
        <div className="p-6 space-y-6">
          {/* Header Banner for print & screen */}
          <div className="text-center space-y-2 border-b border-[#E5DFD5] pb-4">
            <div className="inline-flex items-center gap-2 text-xs font-serif uppercase tracking-widest text-[#B88B22] font-bold">
              <span>{tr('Kiran Marriage Bureau Lahore', 'کرن میرج بیورو لاہور')}</span>
              <span>•</span>
              <span>{tr('Official Matrimonial Evaluation', 'سرکاری ازدواجی موازنہ')}</span>
            </div>
            <div className="flex items-center justify-center gap-6">
              <h3 className="font-serif text-lg font-bold text-[#800F2F]">
                {profileA.name} ({profileA.formNo})
              </h3>
              <div className="flex flex-col items-center">
                <MatchRing score={match.finalScore} size={64} strokeWidth={6} />
                <Badge tier={match.tier} className="mt-1 text-[10px]" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#800F2F]">
                {profileB.name} ({profileB.formNo})
              </h3>
            </div>
          </div>

          {/* Comparison Table */}
          <table className="w-full text-xs border border-[#E5DFD5] border-collapse">
            <thead>
              <tr className="bg-[#800F2F] text-[#F8F5F0]">
                <th className="p-2.5 text-start w-1/3">{tr('Candidate:', 'امیدوار:')} {profileA.name}</th>
                <th className="p-2.5 text-center w-1/3 text-[#D4AF37] font-serif">{tr('Comparison Factor', 'موازنے کا پہلو')}</th>
                <th className="p-2.5 text-end w-1/3">{tr('Partner:', 'فریقِ ثانی:')} {profileB.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD5]">
              <tr>
                <td className="p-3 font-semibold text-[#2C2526]">{profileA.gender === 'Male' ? tr('Male', 'مرد') : tr('Female', 'خاتون')} ({profileA.age} {tr('Yrs', 'سال')})</td>
                <td className="p-3 text-center bg-[#F8F5F0] text-[#6E6466] font-medium">{tr('Gender & Age', 'جنس اور عمر')}</td>
                <td className="p-3 text-end font-semibold text-[#2C2526]">{profileB.gender === 'Male' ? tr('Male', 'مرد') : tr('Female', 'خاتون')} ({profileB.age} {tr('Yrs', 'سال')})</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#2C2526]">{profileA.height}</td>
                <td className="p-3 text-center bg-[#F8F5F0] text-[#6E6466] font-medium">{tr('Height', 'قد')}</td>
                <td className="p-3 text-end font-semibold text-[#2C2526]">{profileB.height}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#2C2526]">{profileA.maritalStatus}</td>
                <td className="p-3 text-center bg-[#F8F5F0] text-[#6E6466] font-medium">{tr('Marital Status', 'ازدواجی حیثیت')}</td>
                <td className="p-3 text-end font-semibold text-[#2C2526]">{profileB.maritalStatus}</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-[#800F2F]">{profileA.caste}</td>
                <td className="p-3 text-center bg-[#F8F5F0] text-[#6E6466] font-medium">{tr('Caste / Qaum', 'ذات / قوم')}</td>
                <td className="p-3 text-end font-bold text-[#800F2F]">{profileB.caste}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#2C2526]">{profileA.maslak}</td>
                <td className="p-3 text-center bg-[#F8F5F0] text-[#6E6466] font-medium">{tr('Maslak / Sect', 'مسلک / فرقہ')}</td>
                <td className="p-3 text-end font-semibold text-[#2C2526]">{profileB.maslak}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#2C2526]">{profileA.city} ({profileA.societyName || tr('Lahore', 'لاہور')})</td>
                <td className="p-3 text-center bg-[#F8F5F0] text-[#6E6466] font-medium">{tr('City & Area', 'شہر اور علاقہ')}</td>
                <td className="p-3 text-end font-semibold text-[#2C2526]">{profileB.city} ({profileB.societyName || tr('Lahore', 'لاہور')})</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#2C2526]">{profileA.degree}</td>
                <td className="p-3 text-center bg-[#F8F5F0] text-[#6E6466] font-medium">{tr('Education Qualification', 'تعلیمی قابلیت')}</td>
                <td className="p-3 text-end font-semibold text-[#2C2526]">{profileB.degree}</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-[#2C2526]">{profileA.profession} {profileA.designation ? `(${profileA.designation})` : ''}</td>
                <td className="p-3 text-center bg-[#F8F5F0] text-[#6E6466] font-medium">{tr('Profession & Designation', 'پیشہ اور عہدہ')}</td>
                <td className="p-3 text-end font-semibold text-[#2C2526]">{profileB.profession} {profileB.designation ? `(${profileB.designation})` : ''}</td>
              </tr>
              <tr>
                <td className="p-3 text-[#6E6466]">{profileA.fatherOccupation}</td>
                <td className="p-3 text-center bg-[#F8F5F0] text-[#6E6466] font-medium">{tr('Father Occupation', 'والد کا پیشہ')}</td>
                <td className="p-3 text-end text-[#6E6466]">{profileB.fatherOccupation}</td>
              </tr>
              <tr>
                <td className="p-3 text-[#6E6466]">{profileA.totalSiblings} ({profileA.marriedSiblingsCount} {tr('married', 'شادی شدہ')})</td>
                <td className="p-3 text-center bg-[#F8F5F0] text-[#6E6466] font-medium">{tr('Siblings Background', 'بہن بھائیوں کی تفصیل')}</td>
                <td className="p-3 text-end text-[#6E6466]">{profileB.totalSiblings} ({profileB.marriedSiblingsCount} {tr('married', 'شادی شدہ')})</td>
              </tr>
            </tbody>
          </table>

          {/* Compatibility Breakdown Box */}
          <div className="bg-[#F8F5F0] p-4 rounded-xl border border-[#E5DFD5]">
            <h4 className="font-serif font-bold text-xs uppercase text-[#800F2F] tracking-wider mb-3">
              {tr('Detailed Compatibility Audit Breakdown', 'تفصیلی مطابقت سکور کارڈ')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {match.breakdown.map(item => (
                <div key={item.key} className="flex items-center justify-between p-2 rounded bg-white border border-[#E5DFD5]">
                  <div className="flex items-center gap-2">
                    {item.matched ? (
                      <div className="w-4 h-4 rounded-full bg-[#D4AF37] text-[#660A22] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-[#A3182E] text-[#F8F5F0] flex items-center justify-center shrink-0">
                        <X className="w-3 h-3" />
                      </div>
                    )}
                    <span className="font-medium text-[#2C2526]">{isUr ? (item.labelUr || item.labelEn) : item.labelEn}</span>
                  </div>
                  <span className="font-mono font-bold text-[#800F2F]">
                    {item.scoreContribution} / {item.maxScore}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer (No-print) */}
        <div className="no-print p-4 bg-[#F8F5F0] border-t border-[#E5DFD5] flex justify-end gap-2 shrink-0">
          <Button variant="secondary" onClick={onClose}>
            {tr('Close', 'بند کریں')}
          </Button>
          <Button variant="primary" onClick={handlePrint} icon={<Printer className="w-4 h-4 text-[#D4AF37]" />}>
            {tr('Print Document', 'پرنٹ کریں')}
          </Button>
        </div>
      </div>
    </div>
  );
}

