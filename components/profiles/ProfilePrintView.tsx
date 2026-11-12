'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Profile } from '@/lib/types';
import { store } from '@/lib/db/store';
import { useLanguage } from '@/lib/useLanguage';
import { formatPKR, formatDate, maskCNIC, maskPhone } from '@/lib/utils';
import { Button } from '../ui/Button';
import { exportSingleProfilePDF } from '@/lib/pdf-export';
import { Printer, Download, Eye, EyeOff, Globe, FileText } from 'lucide-react';

interface ProfilePrintViewProps {
  profile: Profile;
  onClose?: () => void;
}

export function ProfilePrintView({ profile, onClose }: ProfilePrintViewProps) {
  const { tr } = useLanguage();
  const [hideContact, setHideContact] = useState(true);
  const [docLang, setDocLang] = useState<'en' | 'ur' | 'both'>('both');
  const settings = store.getSettings();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#FFFFFF] text-[#2C2526] max-w-4xl mx-auto my-6 p-6 sm:p-10 border border-[#E5DFD5] rounded-xl shadow-lg print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none">
      {/* Controls Bar (hidden during print) */}
      <div className="no-print bg-[#F8F5F0] p-4 rounded-xl border border-[#E5DFD5] mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={handlePrint}
            icon={<Printer className="w-4 h-4 text-[#D4AF37]" />}
          >
            {tr('Print Profile Form', 'پروفائل فارم پرنٹ کریں')}
          </Button>

          <Button
            size="sm"
            variant="accent"
            onClick={() => exportSingleProfilePDF(profile, settings)}
            icon={<FileText className="w-4 h-4 text-[#800F2F]" />}
          >
            {tr('Download Biodata PDF', 'بائیوڈیٹا پی ڈی ایف ڈاؤنلوڈ')}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handlePrint}
            icon={<Download className="w-4 h-4 text-[#800F2F]" />}
          >
            {tr('Print / Browser PDF', 'پرنٹ / براؤزر پی ڈی ایف')}
          </Button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Privacy Toggle */}
          <button
            type="button"
            onClick={() => setHideContact(!hideContact)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              hideContact
                ? 'bg-[#800F2F] text-[#F8F5F0] border-[#800F2F]'
                : 'bg-[#FFFFFF] text-[#800F2F] border-[#E5DFD5]'
            }`}
          >
            {hideContact ? <EyeOff className="w-3.5 h-3.5 text-[#D4AF37]" /> : <Eye className="w-3.5 h-3.5 text-[#800F2F]" />}
            <span>{hideContact ? tr('Family Share Copy (Contact Hidden)', 'خاندانی کاپی (رابطہ نمبر مخفی)') : tr('Internal Office Copy (Full Contact)', 'دفتری کاپی (مکمل رابطہ)')}</span>
          </button>

          {/* Language Selector */}
          <div className="inline-flex items-center rounded-lg border border-[#E5DFD5] bg-[#FFFFFF] p-0.5">
            <button
              onClick={() => setDocLang('en')}
              className={`px-2 py-1 text-xs rounded ${docLang === 'en' ? 'bg-[#800F2F] text-[#F8F5F0]' : 'text-[#6E6466]'}`}
            >
              EN
            </button>
            <button
              onClick={() => setDocLang('ur')}
              className={`px-2 py-1 text-xs rounded ${docLang === 'ur' ? 'bg-[#800F2F] text-[#F8F5F0]' : 'text-[#6E6466]'}`}
            >
              اردو
            </button>
            <button
              onClick={() => setDocLang('both')}
              className={`px-2 py-1 text-xs rounded ${docLang === 'both' ? 'bg-[#800F2F] text-[#F8F5F0]' : 'text-[#6E6466]'}`}
            >
              Bilingual
            </button>
          </div>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="border-2 border-[#800F2F] p-6 rounded-lg bg-white">
        {/* Document Header */}
        <div className="flex items-center justify-between border-b-2 border-[#800F2F] pb-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 relative shrink-0">
              <Image
                src="/brand/logo-print.png"
                alt="Kiran Marriage Bureau"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#800F2F] tracking-wider leading-none">
                KIRAN MARRIAGE BUREAU
              </h1>
              <h2 className="font-urdu text-lg font-bold text-[#800F2F] leading-tight">
                کرن میرج بیورو لاہور
              </h2>
              <p className="text-[11px] text-[#6E6466] mt-0.5">
                {settings.address}
              </p>
              <p className="text-[11px] font-semibold text-[#800F2F]">
                Ph: {settings.phone1} • WhatsApp: {settings.whatsapp}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-right">
            {profile.photoUrl && (
              <div className="w-20 h-20 rounded-lg border-2 border-[#800F2F] overflow-hidden shrink-0 bg-[#F8F5F0]">
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <div className="border border-[#800F2F] px-3 py-1.5 rounded bg-[#F8F5F0] text-center">
                <span className="text-[10px] uppercase font-bold text-[#6E6466] block">
                  Register / Form No / فارم نمبر
                </span>
                <span className="font-serif text-xl font-bold text-[#800F2F]">
                  {profile.formNo}
                </span>
              </div>
              <div className="text-[10px] text-[#6E6466] mt-1">
                Date: {formatDate(profile.dateApplied)}
              </div>
              {profile.premiumMember && (
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#D4AF37] text-[#660A22]">
                  ★ PREMIUM RISHTA
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 1: Personal Details */}
        <div className="mb-4">
          <div className="bg-[#800F2F] text-[#F8F5F0] px-3 py-1 text-xs font-bold uppercase tracking-wider flex justify-between items-center">
            <span>1. Personal Details / ذاتی کوائف</span>
            <span className="font-urdu font-normal text-xs">حصہ اول</span>
          </div>
          <table className="w-full text-xs border border-[#E5DFD5] border-collapse mt-1">
            <tbody>
              <tr className="border-b border-[#E5DFD5]">
                <td className="w-1/4 p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Full Name / نام:</td>
                <td className="w-1/4 p-2 font-bold">{profile.name}</td>
                <td className="w-1/4 p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Gender / جنس:</td>
                <td className="w-1/4 p-2">{profile.gender}</td>
              </tr>
              <tr className="border-b border-[#E5DFD5]">
                <td className="p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Age & Height / عمر و قد:</td>
                <td className="p-2">{profile.age} Years ({profile.height})</td>
                <td className="p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Marital Status / ازدواجی حیثیت:</td>
                <td className="p-2">{profile.maritalStatus}</td>
              </tr>
              <tr className="border-b border-[#E5DFD5]">
                <td className="p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">City / رہائشی شہر:</td>
                <td className="p-2">{profile.city}</td>
                <td className="p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Area / Society:</td>
                <td className="p-2">{profile.societyName || 'N/A'}</td>
              </tr>
              {profile.maritalStatus !== 'Never Married' && (
                <tr className="border-b border-[#E5DFD5] bg-[#FFFFFF]">
                  <td className="p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Children Details / بچے:</td>
                  <td colSpan={3} className="p-2">
                    {profile.secondMarriageDetails?.hasChildren
                      ? `Yes (${profile.secondMarriageDetails.childrenCount} children) - ${profile.secondMarriageDetails.custody || ''}`
                      : 'No Children'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Section 2: Educational & Professional */}
        <div className="mb-4">
          <div className="bg-[#800F2F] text-[#F8F5F0] px-3 py-1 text-xs font-bold uppercase tracking-wider flex justify-between items-center">
            <span>2. Educational & Professional / تعلیمی و پیشہ ورانہ کوائف</span>
            <span className="font-urdu font-normal text-xs">حصہ دوم</span>
          </div>
          <table className="w-full text-xs border border-[#E5DFD5] border-collapse mt-1">
            <tbody>
              <tr className="border-b border-[#E5DFD5]">
                <td className="w-1/4 p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Degree / ڈگری:</td>
                <td className="w-1/4 p-2 font-bold">{profile.degree}</td>
                <td className="w-1/4 p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Education Level:</td>
                <td className="w-1/4 p-2">{profile.educationLevel}</td>
              </tr>
              <tr className="border-b border-[#E5DFD5]">
                <td className="p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Profession / پیشہ:</td>
                <td className="p-2">{profile.profession}</td>
                <td className="p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Designation / عہدہ:</td>
                <td className="p-2">{profile.designation || 'N/A'}</td>
              </tr>
              <tr className="border-b border-[#E5DFD5]">
                <td className="p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Experience:</td>
                <td className="p-2">{profile.experienceYears ? `${profile.experienceYears} Years` : 'N/A'}</td>
                <td className="p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Monthly Income / آمدنی:</td>
                <td className="p-2 font-semibold">
                  {hideContact ? 'Confidential (Sound)' : formatPKR(profile.monthlyIncome)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Family Details */}
        <div className="mb-4">
          <div className="bg-[#800F2F] text-[#F8F5F0] px-3 py-1 text-xs font-bold uppercase tracking-wider flex justify-between items-center">
            <span>3. Family Details / خاندانی پس منظر</span>
            <span className="font-urdu font-normal text-xs">حصہ سوم</span>
          </div>
          <table className="w-full text-xs border border-[#E5DFD5] border-collapse mt-1">
            <tbody>
              <tr className="border-b border-[#E5DFD5]">
                <td className="w-1/4 p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Father Name & Work:</td>
                <td className="w-1/4 p-2">{profile.fatherName} ({profile.fatherOccupation})</td>
                <td className="w-1/4 p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Mother Name & Work:</td>
                <td className="w-1/4 p-2">{profile.motherName} ({profile.motherOccupation})</td>
              </tr>
              <tr className="border-b border-[#E5DFD5]">
                <td className="p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Caste / قوم و ذات:</td>
                <td className="p-2 font-bold text-[#800F2F]">{profile.caste}</td>
                <td className="p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Sect / مسلک:</td>
                <td className="p-2">{profile.maslak}</td>
              </tr>
              <tr className="border-b border-[#E5DFD5]">
                <td className="p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Siblings / بہن بھائی:</td>
                <td colSpan={3} className="p-2">
                  Total {profile.totalSiblings} ({profile.brothersCount} Brothers, {profile.sistersCount} Sisters) • {profile.marriedSiblingsCount} Married
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 4: Partner Preferences */}
        <div className="mb-4">
          <div className="bg-[#800F2F] text-[#F8F5F0] px-3 py-1 text-xs font-bold uppercase tracking-wider flex justify-between items-center">
            <span>4. Partner Preferences / شریک حیات کے لیے شرائط و ترجیحات</span>
            <span className="font-urdu font-normal text-xs">حصہ چہارم</span>
          </div>
          <table className="w-full text-xs border border-[#E5DFD5] border-collapse mt-1">
            <tbody>
              <tr className="border-b border-[#E5DFD5]">
                <td className="w-1/4 p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Age Range / عمر کی حد:</td>
                <td className="w-1/4 p-2">{profile.preferences.ageMin} – {profile.preferences.ageMax} Years</td>
                <td className="w-1/4 p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Preferred Cities:</td>
                <td className="w-1/4 p-2">{profile.preferences.cities.join(', ')}</td>
              </tr>
              <tr className="border-b border-[#E5DFD5]">
                <td className="p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Preferred Caste / قوم:</td>
                <td className="p-2">{profile.preferences.castes.join(', ')}</td>
                <td className="p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Preferred Maslak:</td>
                <td className="p-2">{profile.preferences.maslak}</td>
              </tr>
              <tr className="border-b border-[#E5DFD5]">
                <td className="p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Minimum Education:</td>
                <td className="p-2">{profile.preferences.educationMin}</td>
                <td className="p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Other Expectations:</td>
                <td className="p-2">{profile.preferences.otherNotes || 'Respectable, religious family values'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 5: Contact Details (Conditional on Privacy toggle) */}
        <div className="mb-2">
          <div className="bg-[#800F2F] text-[#F8F5F0] px-3 py-1 text-xs font-bold uppercase tracking-wider flex justify-between items-center">
            <span>5. Contact Information / رابطہ کوائف</span>
            <span className="text-[10px] font-normal text-[#D4AF37]">
              {hideContact ? 'Confidential Family Copy' : 'Official Office Copy'}
            </span>
          </div>

          {hideContact ? (
            <div className="p-3 bg-[#F8F5F0] border border-[#E5DFD5] text-center text-xs text-[#6E6466]">
              <p className="font-semibold text-[#800F2F]">
                Contact numbers and residential address are kept confidential by Kiran Marriage Bureau.
              </p>
              <p className="text-[11px] mt-0.5">
                For family meetings and verified introduction, please contact our Lahore office:
                <br />
                <strong className="text-[#800F2F]">Ph: {settings.phone1} / WhatsApp: {settings.whatsapp}</strong>
              </p>
            </div>
          ) : (
            <table className="w-full text-xs border border-[#E5DFD5] border-collapse mt-1">
              <tbody>
                <tr className="border-b border-[#E5DFD5]">
                  <td className="w-1/4 p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Phone Number:</td>
                  <td className="w-1/4 p-2 font-bold">{profile.phone}</td>
                  <td className="w-1/4 p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">WhatsApp Number:</td>
                  <td className="w-1/4 p-2">{profile.whatsapp}</td>
                </tr>
                <tr className="border-b border-[#E5DFD5]">
                  <td className="p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Guardian Name & Phone:</td>
                  <td className="p-2">{profile.guardianName || 'N/A'} ({profile.guardianPhone || 'N/A'})</td>
                  <td className="p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">CNIC:</td>
                  <td className="p-2">{profile.cnic ? maskCNIC(profile.cnic) : 'N/A'}</td>
                </tr>
                <tr>
                  <td className="p-2 bg-[#F8F5F0] font-semibold text-[#800F2F]">Address:</td>
                  <td colSpan={3} className="p-2">{profile.address}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Bureau Footer Stamp */}
        <div className="mt-6 pt-4 border-t border-[#D4AF37] flex items-center justify-between text-[11px] text-[#6E6466]">
          <div>
            <p className="font-serif font-bold text-[#800F2F]">KIRAN MARRIAGE BUREAU • LAHORE</p>
            <p>Dignified Matchmaking & Matrimonial Verification Services</p>
          </div>
          <div className="text-right">
            <p>Authorized Signature: _________________________</p>
            <p className="text-[10px] text-[#6E6466]/80">Stamp & Date</p>
          </div>
        </div>
      </div>
    </div>
  );
}

