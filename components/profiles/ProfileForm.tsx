'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Profile, PartnerPreferences, Gender, MaritalStatus, EducationLevel, Maslak, Religion } from '@/lib/types';
import { store } from '@/lib/db/store';
import { t, GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, EDUCATION_LEVEL_OPTIONS, RELIGION_OPTIONS, MASLAK_OPTIONS, COMMON_CASTES, COMMON_CITIES } from '@/lib/i18n';
import { Button } from '../ui/Button';
import { EntrySidePanel } from './EntrySidePanel';
import { AlertCircle, CheckCircle, Save, Printer, Share2, Star } from 'lucide-react';

interface ProfileFormProps {
  initialData?: Partial<Profile>;
  isPublic?: boolean;
  onSuccess?: (profile: Profile) => void;
}

export function ProfileForm({
  initialData,
  isPublic = false,
  onSuccess,
}: ProfileFormProps) {
  const router = useRouter();
  const lang = store.getLanguage();
  const currentUser = store.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  // State
  const [formData, setFormData] = useState<Partial<Profile>>({
    formNo: initialData?.formNo || (isPublic ? '' : store.getNextFormNo()),
    dateApplied: initialData?.dateApplied || new Date().toISOString().split('T')[0],
    appliedBy: initialData?.appliedBy || (isPublic ? 'Self (Online)' : ''),
    name: initialData?.name || '',
    gender: initialData?.gender || 'Male',
    age: initialData?.age || 26,
    dateOfBirth: initialData?.dateOfBirth || '',
    maritalStatus: initialData?.maritalStatus || 'Never Married',
    secondMarriageDetails: initialData?.secondMarriageDetails || {
      hasChildren: false,
      childrenCount: 0,
      custody: '',
    },
    height: initialData?.height || "5'9\"",
    city: initialData?.city || 'Lahore',
    societyName: initialData?.societyName || '',
    degree: initialData?.degree || '',
    educationLevel: initialData?.educationLevel || 'Bachelors',
    profession: initialData?.profession || '',
    designation: initialData?.designation || '',
    experienceYears: initialData?.experienceYears || 0,
    businessNameAddress: initialData?.businessNameAddress || '',
    monthlyIncome: initialData?.monthlyIncome || 150000,
    fatherName: initialData?.fatherName || '',
    fatherOccupation: initialData?.fatherOccupation || '',
    motherName: initialData?.motherName || '',
    motherOccupation: initialData?.motherOccupation || '',
    totalSiblings: initialData?.totalSiblings || 2,
    brothersCount: initialData?.brothersCount || 1,
    sistersCount: initialData?.sistersCount || 1,
    marriedSiblingsCount: initialData?.marriedSiblingsCount || 0,
    religion: initialData?.religion || 'Islam',
    caste: initialData?.caste || 'Arain',
    maslak: initialData?.maslak || 'Sunni / Hanafi',
    phone: initialData?.phone || '',
    whatsapp: initialData?.whatsapp || '',
    guardianName: initialData?.guardianName || '',
    guardianPhone: initialData?.guardianPhone || '',
    address: initialData?.address || '',
    cnic: initialData?.cnic || '',
    remarks: initialData?.remarks || '',
    premiumMember: initialData?.premiumMember || false,
    preferences: initialData?.preferences || {
      ageMin: 22,
      ageMax: 28,
      heightMin: "5'2\"",
      heightMax: "5'8\"",
      cities: ['Lahore'],
      educationMin: 'Bachelors',
      maritalStatuses: ['Never Married'],
      castes: ['Arain', 'Any'],
      maslak: 'Sunni / Hanafi',
      minIncome: 100000,
      otherNotes: '',
    },
  });

  const [honeypot, setHoneypot] = useState(''); // Anti-spam for public
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState<Profile | null>(null);

  // Field change handler
  const handleChange = (field: keyof Profile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Check duplicate phone if phone changes
    if (field === 'phone') {
      const match = store.checkDuplicatePhone(value, initialData?.id);
      if (match) {
        setDuplicateWarning(
          `Phone number already registered with profile ${match.formNo} (${match.name}). Staff will review.`
        );
      } else {
        setDuplicateWarning(null);
      }
    }
  };

  const handlePrefChange = (prefField: keyof PartnerPreferences, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...(prev.preferences as PartnerPreferences),
        [prefField]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPublic && honeypot) {
      // Honeypot trapped bot
      return;
    }

    setSubmitting(true);

    try {
      if (initialData?.id) {
        // Edit existing
        const updated = store.updateProfile(initialData.id, formData);
        if (updated) {
          if (onSuccess) onSuccess(updated);
          else router.push(`/profiles/${updated.id}`);
        }
      } else {
        // Create new
        const status = isPublic ? 'pending_approval' : 'active';
        const created = store.addProfile({
          ...(formData as any),
          status,
        });

        if (isPublic) {
          setSavedSuccess(created);
        } else {
          if (onSuccess) onSuccess(created);
          else router.push(`/profiles/${created.id}`);
        }
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // If public thank-you page after submission
  if (savedSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-[#FFFDF8] border border-[#E9DDC3] rounded-2xl shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#D9A93F]/20 text-[#5A0A14] border border-[#D9A93F] flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-[#5A0A14]" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-[#5A0A14]">
            Registration Submitted Successfully!
          </h2>
          <p className="text-sm font-urdu text-[#7B5E5E]">
            آپ کا رشتہ رجسٹریشن فارم کامیابی سے موصول ہو چکا ہے۔
          </p>
        </div>

        <div className="p-4 bg-[#FBF4E6] rounded-xl border border-[#E9DDC3] inline-block">
          <span className="text-xs uppercase tracking-wider text-[#7B5E5E] font-medium block">
            Your Official Registration Reference
          </span>
          <span className="font-serif text-3xl font-bold text-[#5A0A14] tracking-widest">
            {savedSuccess.formNo}
          </span>
        </div>

        <p className="text-xs text-[#7B5E5E] max-w-md mx-auto leading-relaxed">
          Our senior coordinator will verify your information and contact you within 24–48 hours. Your contact details remain 100% confidential.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="primary"
            onClick={() => window.print()}
            icon={<Printer className="w-4 h-4 text-[#D9A93F]" />}
          >
            Print Submitted Form
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              const url = `https://wa.me/?text=My%20Kiran%20Marriage%20Bureau%20Registration%20Number%20is%20${savedSuccess.formNo}`;
              window.open(url, '_blank');
            }}
            icon={<Share2 className="w-4 h-4 text-[#5A0A14]" />}
          >
            Save Reference to WhatsApp
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Form Content */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-8 bg-[#FFFDF8] border border-[#E9DDC3] rounded-2xl shadow-sm overflow-hidden"
      >
        {/* Anti-spam honeypot */}
        {isPublic && (
          <input
            type="text"
            name="website_extra_check"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />
        )}

        {/* Duplicate phone warning alert inside palette */}
        {duplicateWarning && (
          <div className="p-4 bg-[#FBF4E6] border-b border-[#D9A93F] flex items-center gap-3 text-xs text-[#5A0A14]">
            <AlertCircle className="w-5 h-5 text-[#D9A93F] shrink-0" />
            <p className="font-medium">{duplicateWarning}</p>
          </div>
        )}

        {/* Section 1: Header */}
        <div className="bg-[#5A0A14] text-[#FBF4E6] px-6 py-4 flex items-center justify-between border-b border-[#D9A93F]">
          <div>
            <h2 className="font-serif text-lg font-bold tracking-wide">
              {t('secHeader', lang)}
            </h2>
            <span className="text-xs text-[#E9DDC3] font-urdu">
              کرن میرج بیورو رجسٹریشن فارم
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-[#E9DDC3] block text-[10px]">Form No:</span>
              {isAdmin && !isPublic ? (
                <input
                  type="text"
                  value={formData.formNo}
                  onChange={(e) => handleChange('formNo', e.target.value)}
                  className="bg-[#420610] text-[#D9A93F] font-bold px-2 py-0.5 rounded border border-[#D9A93F]/50 text-xs w-28"
                />
              ) : (
                <span className="font-bold text-[#D9A93F] text-sm tracking-wider">
                  {formData.formNo || 'Auto (KMB-XXXX)'}
                </span>
              )}
            </div>
            <div>
              <span className="text-[#E9DDC3] block text-[10px]">Date:</span>
              <span className="font-medium">{formData.dateApplied}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Applied By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                {t('appliedBy', lang)} *
              </label>
              <input
                type="text"
                required
                value={formData.appliedBy}
                onChange={(e) => handleChange('appliedBy', e.target.value)}
                placeholder="e.g. Father, Mother, Self, Brother"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
              />
            </div>
            {!isPublic && (
              <div className="flex items-center gap-2 pt-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#5A0A14]">
                  <input
                    type="checkbox"
                    checked={formData.premiumMember}
                    onChange={(e) => handleChange('premiumMember', e.target.checked)}
                    className="w-4 h-4 text-[#D9A93F] rounded border-[#E9DDC3] focus:ring-[#D9A93F]"
                  />
                  <Star className="w-4 h-4 text-[#D9A93F] fill-[#D9A93F]" />
                  <span>Grant Premium Membership (Highlighted in Matches)</span>
                </label>
              </div>
            )}
          </div>

          {/* Section 2: Personal Details */}
          <div>
            <div className="bg-[#5A0A14] text-[#FBF4E6] px-4 py-2 rounded-lg flex items-center justify-between mb-4">
              <h3 className="font-serif text-sm font-bold tracking-wide">
                1. {t('secPersonal', lang)}
              </h3>
              <span className="text-xs font-urdu text-[#E9DDC3]">ذاتی کوائف</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('name', lang)} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Full Candidate Name"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('gender', lang)} *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value as Gender)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
                >
                  {GENDER_OPTIONS.map(g => (
                    <option key={g.value} value={g.value}>
                      {lang === 'ur' ? g.labelUr : g.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('age', lang)} *
                </label>
                <input
                  type="number"
                  required
                  min={18}
                  max={75}
                  value={formData.age}
                  onChange={(e) => handleChange('age', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('dob', lang)}
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('height', lang)} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                  placeholder="e.g. 5'10&quot; or 178 cm"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('maritalStatus', lang)} *
                </label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => handleChange('maritalStatus', e.target.value as MaritalStatus)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
                >
                  {MARITAL_STATUS_OPTIONS.map(ms => (
                    <option key={ms.value} value={ms.value}>
                      {lang === 'ur' ? ms.labelUr : ms.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('city', lang)} *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
                >
                  {COMMON_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('societyName', lang)}
                </label>
                <input
                  type="text"
                  value={formData.societyName}
                  onChange={(e) => handleChange('societyName', e.target.value)}
                  placeholder="e.g. DHA Phase 5, Model Town, Bahria Town"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
                />
              </div>
            </div>

            {/* Second Marriage Conditional Fields */}
            {formData.maritalStatus !== 'Never Married' && (
              <div className="mt-4 p-4 rounded-xl bg-[#FBF4E6] border border-[#D9A93F]/40 space-y-3">
                <h4 className="text-xs font-bold text-[#5A0A14] uppercase tracking-wide">
                  {t('secondMarriageNotice', lang)}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-[#5A0A14] mb-1">
                      {t('hasChildren', lang)}
                    </label>
                    <select
                      value={formData.secondMarriageDetails?.hasChildren ? 'yes' : 'no'}
                      onChange={(e) =>
                        handleChange('secondMarriageDetails', {
                          ...formData.secondMarriageDetails,
                          hasChildren: e.target.value === 'yes',
                        })
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FFFDF8]"
                    >
                      <option value="no">No Children</option>
                      <option value="yes">Yes, Has Children</option>
                    </select>
                  </div>

                  {formData.secondMarriageDetails?.hasChildren && (
                    <>
                      <div>
                        <label className="block text-xs text-[#5A0A14] mb-1">
                          {t('childrenCount', lang)}
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={formData.secondMarriageDetails?.childrenCount || 1}
                          onChange={(e) =>
                            handleChange('secondMarriageDetails', {
                              ...formData.secondMarriageDetails,
                              childrenCount: parseInt(e.target.value, 10),
                            })
                          }
                          className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FFFDF8]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#5A0A14] mb-1">
                          {t('custody', lang)}
                        </label>
                        <input
                          type="text"
                          value={formData.secondMarriageDetails?.custody || ''}
                          onChange={(e) =>
                            handleChange('secondMarriageDetails', {
                              ...formData.secondMarriageDetails,
                              custody: e.target.value,
                            })
                          }
                          placeholder="e.g. Lives with mother"
                          className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FFFDF8]"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Educational & Professional */}
          <div>
            <div className="bg-[#5A0A14] text-[#FBF4E6] px-4 py-2 rounded-lg flex items-center justify-between mb-4">
              <h3 className="font-serif text-sm font-bold tracking-wide">
                2. {t('secEducation', lang)}
              </h3>
              <span className="text-xs font-urdu text-[#E9DDC3]">تعلیمی و پیشہ ورانہ کوائف</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('degree', lang)} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.degree}
                  onChange={(e) => handleChange('degree', e.target.value)}
                  placeholder="e.g. BS Computer Science (FAST), MBBS (KEMU)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('educationLevel', lang)} *
                </label>
                <select
                  value={formData.educationLevel}
                  onChange={(e) => handleChange('educationLevel', e.target.value as EducationLevel)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
                >
                  {EDUCATION_LEVEL_OPTIONS.map(ed => (
                    <option key={ed.value} value={ed.value}>
                      {lang === 'ur' ? ed.labelUr : ed.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('profession', lang)} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.profession}
                  onChange={(e) => handleChange('profession', e.target.value)}
                  placeholder="e.g. Software Engineer, Doctor, Chartered Accountant"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('designation', lang)}
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                  placeholder="e.g. Senior Manager, Principal Architect"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('monthlyIncome', lang)} (PKR)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={formData.monthlyIncome}
                  onChange={(e) => handleChange('monthlyIncome', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('businessAddress', lang)}
                </label>
                <input
                  type="text"
                  value={formData.businessNameAddress}
                  onChange={(e) => handleChange('businessNameAddress', e.target.value)}
                  placeholder="Company name / Business premises"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Family Details */}
          <div>
            <div className="bg-[#5A0A14] text-[#FBF4E6] px-4 py-2 rounded-lg flex items-center justify-between mb-4">
              <h3 className="font-serif text-sm font-bold tracking-wide">
                3. {t('secFamily', lang)}
              </h3>
              <span className="text-xs font-urdu text-[#E9DDC3]">خاندانی پس منظر و مذہب</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('fatherName', lang)} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fatherName}
                  onChange={(e) => handleChange('fatherName', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('fatherOccupation', lang)} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fatherOccupation}
                  onChange={(e) => handleChange('fatherOccupation', e.target.value)}
                  placeholder="e.g. Govt Officer, Businessman, Landlord"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('motherName', lang)} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.motherName}
                  onChange={(e) => handleChange('motherName', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('motherOccupation', lang)}
                </label>
                <input
                  type="text"
                  value={formData.motherOccupation}
                  onChange={(e) => handleChange('motherOccupation', e.target.value)}
                  placeholder="e.g. Homemaker, Teacher, Doctor"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('caste', lang)} *
                </label>
                <select
                  value={formData.caste}
                  onChange={(e) => handleChange('caste', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none font-medium"
                >
                  {COMMON_CASTES.filter(c => c !== 'Any').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('maslak', lang)} *
                </label>
                <select
                  value={formData.maslak}
                  onChange={(e) => handleChange('maslak', e.target.value as Maslak)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] focus:border-[#D9A93F] focus:outline-none"
                >
                  {MASLAK_OPTIONS.map(m => (
                    <option key={m.value} value={m.value}>
                      {lang === 'ur' ? m.labelUr : m.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('totalSiblings', lang)}
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.totalSiblings}
                  onChange={(e) => handleChange('totalSiblings', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('marriedSiblings', lang)}
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.marriedSiblingsCount}
                  onChange={(e) => handleChange('marriedSiblingsCount', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F]"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Partner Preferences */}
          <div>
            <div className="bg-[#5A0A14] text-[#FBF4E6] px-4 py-2 rounded-lg flex items-center justify-between mb-4">
              <h3 className="font-serif text-sm font-bold tracking-wide">
                4. {t('secPreferences', lang)}
              </h3>
              <span className="text-xs font-urdu text-[#E9DDC3]">شریک حیات کی ترجیحات</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('prefAgeRange', lang)} (Min - Max)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={18}
                    max={70}
                    value={formData.preferences?.ageMin}
                    onChange={(e) => handlePrefChange('ageMin', parseInt(e.target.value, 10))}
                    className="w-1/2 px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6]"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    min={18}
                    max={70}
                    value={formData.preferences?.ageMax}
                    onChange={(e) => handlePrefChange('ageMax', parseInt(e.target.value, 10))}
                    className="w-1/2 px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('prefEducationMin', lang)}
                </label>
                <select
                  value={formData.preferences?.educationMin}
                  onChange={(e) => handlePrefChange('educationMin', e.target.value as EducationLevel)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6]"
                >
                  {EDUCATION_LEVEL_OPTIONS.map(ed => (
                    <option key={ed.value} value={ed.value}>
                      {lang === 'ur' ? ed.labelUr : ed.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('prefCastes', lang)}
                </label>
                <select
                  value={formData.preferences?.castes?.[0] || 'Any'}
                  onChange={(e) => handlePrefChange('castes', [e.target.value])}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6]"
                >
                  {COMMON_CASTES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('prefMaslak', lang)}
                </label>
                <select
                  value={formData.preferences?.maslak}
                  onChange={(e) => handlePrefChange('maslak', e.target.value as Maslak)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6]"
                >
                  {MASLAK_OPTIONS.map(m => (
                    <option key={m.value} value={m.value}>
                      {lang === 'ur' ? m.labelUr : m.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('prefOtherNotes', lang)}
                </label>
                <textarea
                  rows={2}
                  value={formData.preferences?.otherNotes || ''}
                  onChange={(e) => handlePrefChange('otherNotes', e.target.value)}
                  placeholder="Describe your family values, relocation flexibility, expectations..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F]"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Contact Information */}
          <div>
            <div className="bg-[#5A0A14] text-[#FBF4E6] px-4 py-2 rounded-lg flex items-center justify-between mb-4">
              <h3 className="font-serif text-sm font-bold tracking-wide">
                5. {t('secContact', lang)}
              </h3>
              <span className="text-[11px] text-[#D9A93F]">
                {isPublic ? 'Kept 100% Confidential' : 'Internal Staff Only'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('phone', lang)} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="0300 1234567"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('whatsapp', lang)} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  placeholder="0300 1234567"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('guardianName', lang)}
                </label>
                <input
                  type="text"
                  value={formData.guardianName}
                  onChange={(e) => handleChange('guardianName', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('guardianPhone', lang)}
                </label>
                <input
                  type="text"
                  value={formData.guardianPhone}
                  onChange={(e) => handleChange('guardianPhone', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                  {t('address', lang)} *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="House number, Street, Sector, City"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F]"
                />
              </div>

              {!isPublic && (
                <div>
                  <label className="block text-xs font-semibold text-[#5A0A14] mb-1">
                    {t('cnic', lang)} (Admin Eyes Only)
                  </label>
                  <input
                    type="text"
                    value={formData.cnic}
                    onChange={(e) => handleChange('cnic', e.target.value)}
                    placeholder="35202-xxxxxxx-x"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 7: Internal Remarks (Hidden on public) */}
          {!isPublic && (
            <div>
              <div className="bg-[#420610] text-[#D9A93F] px-4 py-2 rounded-lg flex items-center justify-between mb-4">
                <h3 className="font-serif text-sm font-bold tracking-wide">
                  6. {t('secRemarks', lang)}
                </h3>
                <span className="text-[11px] text-[#E9DDC3]">
                  Never shown to clients or in WhatsApp summaries
                </span>
              </div>

              <textarea
                rows={3}
                value={formData.remarks || ''}
                onChange={(e) => handleChange('remarks', e.target.value)}
                placeholder="Internal verification notes, family status, financial assessment..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F]"
              />
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-4 border-t border-[#E9DDC3] flex items-center justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              {t('actionCancel', lang)}
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              icon={<Save className="w-4 h-4 text-[#D9A93F]" />}
            >
              {submitting
                ? 'Saving...'
                : isPublic
                ? 'Submit Online Registration'
                : initialData?.id
                ? 'Save Profile Changes'
                : 'Save & Enter Matching Engine'}
            </Button>
          </div>
        </div>
      </form>

      {/* Real-time Debounced Side Panel (Section 6 of requirements) */}
      <div className="lg:col-span-4 sticky top-24">
        <EntrySidePanel
          currentFormValues={formData}
          savedProfileId={initialData?.id}
        />
      </div>
    </div>
  );
}
