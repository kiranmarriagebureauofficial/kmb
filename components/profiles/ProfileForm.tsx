'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Profile, PartnerPreferences, Gender, MaritalStatus, EducationLevel, Maslak, Religion } from '@/lib/types';
import { store } from '@/lib/db/store';
import { t, GENDER_OPTIONS, MARITAL_STATUS_OPTIONS, EDUCATION_LEVEL_OPTIONS, RELIGION_OPTIONS, MASLAK_OPTIONS, COMMON_CASTES, COMMON_CITIES } from '@/lib/i18n';
import { useLanguage } from '@/lib/useLanguage';
import { Button } from '../ui/Button';
import { EntrySidePanel } from './EntrySidePanel';
import { ProfileAvatar, compressImageToDataUrl } from '../ui/ProfileAvatar';
import { AlertCircle, CheckCircle, Save, Printer, Share2, Star, Camera, Trash2 } from 'lucide-react';

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
  const { lang, tr } = useLanguage();
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
    photoUrl: initialData?.photoUrl || '',
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
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(Boolean(initialData?.id));
  const [submitting, setSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState<Profile | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    try {
      const dataUrl = await compressImageToDataUrl(file, 420, 0.82);
      setHasInteracted(true);
      setFormData(prev => ({ ...prev, photoUrl: dataUrl }));
    } catch (err: any) {
      setPhotoError(err?.message || tr('Could not process selected image.', 'منتخب کردہ تصویر پراسیس نہیں ہو سکی۔'));
    } finally {
      e.target.value = '';
    }
  };

  // Field change handler
  const handleChange = (field: keyof Profile, value: any) => {
    setHasInteracted(true);
    setFormData(prev => ({ ...prev, [field]: value }));

    // Check duplicate phone if phone changes
    if (field === 'phone') {
      const match = store.checkDuplicatePhone(value, initialData?.id);
      if (match) {
        setDuplicateWarning(
          tr(
            `Phone number already registered with profile ${match.formNo} (${match.name}). Staff will review.`,
            `یہ فون نمبر پہلے سے پروفائل ${match.formNo} (${match.name}) کے ساتھ رجسٹرڈ ہے۔ عملہ جائزہ لے گا۔`
          )
        );
      } else {
        setDuplicateWarning(null);
      }
    }
  };

  const handlePrefChange = (prefField: keyof PartnerPreferences, value: any) => {
    setHasInteracted(true);
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
        const status = isPublic ? 'pending_approval' : 'available';
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
      <div className="max-w-2xl mx-auto p-8 bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 text-[#800F2F] border border-[#D4AF37] flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-[#800F2F]" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-[#800F2F]">
            {tr('Registration Submitted Successfully!', 'آپ کا رشتہ رجسٹریشن فارم کامیابی سے موصول ہو چکا ہے۔')}
          </h2>
          {!lang || lang === 'en' ? (
            <p className="text-sm font-urdu text-[#6E6466]">
              آپ کا رشتہ رجسٹریشن فارم کامیابی سے موصول ہو چکا ہے۔
            </p>
          ) : null}
        </div>

        <div className="p-4 bg-[#F8F5F0] rounded-xl border border-[#E5DFD5] inline-block">
          <span className="text-xs uppercase tracking-wider text-[#6E6466] font-medium block">
            {tr('Your Official Registration Reference', 'آپ کا سرکاری رجسٹریشن ریفرنس نمبر')}
          </span>
          <span className="font-serif text-3xl font-bold text-[#800F2F] tracking-widest">
            {savedSuccess.formNo}
          </span>
        </div>

        <p className="text-xs text-[#6E6466] max-w-md mx-auto leading-relaxed">
          {tr(
            'Our senior coordinator will verify your information and contact you within 24–48 hours. Your contact details remain 100% confidential.',
            'ہمارے سینئر کوآرڈینیٹر آپ کی معلومات کی تصدیق کے بعد 24 سے 48 گھنٹوں میں آپ سے رابطہ کریں گے۔ آپ کی ذاتی معلومات 100٪ خفیہ رہیں گی۔'
          )}
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="primary"
            onClick={() => window.print()}
            icon={<Printer className="w-4 h-4 text-[#D4AF37]" />}
          >
            {tr('Print Submitted Form', 'جمع شدہ فارم پرنٹ کریں')}
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              const url = `https://wa.me/?text=My%20Kiran%20Marriage%20Bureau%20Registration%20Number%20is%20${savedSuccess.formNo}`;
              window.open(url, '_blank');
            }}
            icon={<Share2 className="w-4 h-4 text-[#800F2F]" />}
          >
            {tr('Save Reference to WhatsApp', 'ریفرنس نمبر واٹس ایپ پر محفوظ کریں')}
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
        className="lg:col-span-8 bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl shadow-sm overflow-hidden"
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
          <div className="p-4 bg-[#F8F5F0] border-b border-[#D4AF37] flex items-center gap-3 text-xs text-[#800F2F]">
            <AlertCircle className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <p className="font-medium">{duplicateWarning}</p>
          </div>
        )}

        {/* Section 1: Header */}
        <div className="bg-[#800F2F] text-[#F8F5F0] px-6 py-4 flex items-center justify-between border-b border-[#D4AF37]">
          <div>
            <h2 className="font-serif text-lg font-bold tracking-wide">
              {t('secHeader', lang)}
            </h2>
            <span className="text-xs text-[#E5DFD5] font-urdu">
              کرن میرج بیورو رجسٹریشن فارم
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-[#E5DFD5] block text-[10px]">{tr('Register / Form No:', 'رجسٹر / فارم نمبر:')}</span>
              {isAdmin && !isPublic ? (
                <input
                  type="text"
                  value={formData.formNo}
                  onChange={(e) => handleChange('formNo', e.target.value)}
                  className="bg-[#660A22] text-[#D4AF37] font-bold px-2 py-0.5 rounded border border-[#D4AF37]/50 text-xs w-28"
                />
              ) : (
                <span className="font-bold text-[#D4AF37] text-sm tracking-wider">
                  {formData.formNo || tr('Auto (KMB-XXXX)', 'خودکار (KMB-XXXX)')}
                </span>
              )}
            </div>
            <div>
              <span className="text-[#E5DFD5] block text-[10px]">{tr('Date:', 'تاریخ:')}</span>
              <span className="font-medium">{formData.dateApplied}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Client Photo & Applied By */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-xl bg-[#F8F5F0] border border-[#E5DFD5]">
            <div className="md:col-span-5 flex items-center gap-4">
              <ProfileAvatar
                name={formData.name || 'Client'}
                photoUrl={formData.photoUrl}
                size="xl"
                isPremium={Boolean(formData.premiumMember)}
              />
              <div className="space-y-1.5">
                <span className="block text-xs font-bold text-[#800F2F]">
                  {tr('Client Photo (Optional)', 'کلائنٹ کی تصویر (اختیاری)')}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#800F2F] text-[#F8F5F0] hover:bg-[#660A22] text-[11px] font-semibold cursor-pointer transition-colors">
                    <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{formData.photoUrl ? tr('Change Photo', 'تصویر تبدیل کریں') : tr('Upload Photo', 'تصویر اپلوڈ کریں')}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {formData.photoUrl && (
                    <button
                      type="button"
                      onClick={() => handleChange('photoUrl', '')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#A3182E]/30 text-[#A3182E] hover:bg-[#A3182E]/10 text-[11px] font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{tr('Remove', 'ختم کریں')}</span>
                    </button>
                  )}
                </div>
                {photoError && (
                  <p className="text-[11px] text-[#A3182E] font-medium">{photoError}</p>
                )}
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('appliedBy', lang)} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.appliedBy}
                  onChange={(e) => handleChange('appliedBy', e.target.value)}
                  placeholder={tr('e.g. Father, Mother, Self, Brother', 'مثلاً والد، والدہ، خود، بھائی')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#FFFFFF] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              {!isPublic && (
                <div className="flex items-center gap-2 sm:pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#800F2F]">
                    <input
                      type="checkbox"
                      checked={formData.premiumMember}
                      onChange={(e) => handleChange('premiumMember', e.target.checked)}
                      className="w-4 h-4 text-[#D4AF37] rounded border-[#E5DFD5] focus:ring-[#D4AF37]"
                    />
                    <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                    <span>{tr('Premium Membership', 'پریمیم ممبرشپ')}</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Personal Details */}
          <div>
            <div className="bg-[#800F2F] text-[#F8F5F0] px-4 py-2 rounded-lg flex items-center justify-between mb-4">
              <h3 className="font-serif text-sm font-bold tracking-wide">
                1. {t('secPersonal', lang)}
              </h3>
              <span className="text-xs font-urdu text-[#E5DFD5]">ذاتی کوائف</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('name', lang)} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder={tr('Full Candidate Name', 'امیدوار کا مکمل نام')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('gender', lang)} *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value as Gender)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                >
                  {GENDER_OPTIONS.map(g => (
                    <option key={g.value} value={g.value}>
                      {lang === 'ur' ? g.labelUr : g.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('age', lang)} *
                </label>
                <input
                  type="number"
                  required
                  min={18}
                  max={75}
                  value={formData.age}
                  onChange={(e) => handleChange('age', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('dob', lang)}
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('height', lang)} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.height}
                  onChange={(e) => handleChange('height', e.target.value)}
                  placeholder={tr('e.g. 5\'10" or 178 cm', 'مثلاً 5 فٹ 10 انچ یا 178 سینٹی میٹر')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('maritalStatus', lang)} *
                </label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => handleChange('maritalStatus', e.target.value as MaritalStatus)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                >
                  {MARITAL_STATUS_OPTIONS.map(ms => (
                    <option key={ms.value} value={ms.value}>
                      {lang === 'ur' ? ms.labelUr : ms.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('city', lang)} *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                >
                  {COMMON_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('societyName', lang)}
                </label>
                <input
                  type="text"
                  value={formData.societyName}
                  onChange={(e) => handleChange('societyName', e.target.value)}
                  placeholder={tr('e.g. DHA Phase 5, Model Town, Bahria Town', 'مثلاً ڈی ایچ اے فیز 5، ماڈل ٹاؤن، بحریہ ٹاؤن')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            {/* Second Marriage Conditional Fields */}
            {formData.maritalStatus !== 'Never Married' && (
              <div className="mt-4 p-4 rounded-xl bg-[#F8F5F0] border border-[#D4AF37]/40 space-y-3">
                <h4 className="text-xs font-bold text-[#800F2F] uppercase tracking-wide">
                  {t('secondMarriageNotice', lang)}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-[#800F2F] mb-1">
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
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#FFFFFF]"
                    >
                      <option value="no">{tr('No Children', 'کوئی اولاد نہیں')}</option>
                      <option value="yes">{tr('Yes, Has Children', 'جی ہاں، اولاد ہے')}</option>
                    </select>
                  </div>

                  {formData.secondMarriageDetails?.hasChildren && (
                    <>
                      <div>
                        <label className="block text-xs text-[#800F2F] mb-1">
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
                          className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#FFFFFF]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#800F2F] mb-1">
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
                          placeholder={tr('e.g. Lives with mother', 'مثلاً والدہ کے ساتھ رہائش')}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#FFFFFF]"
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
            <div className="bg-[#800F2F] text-[#F8F5F0] px-4 py-2 rounded-lg flex items-center justify-between mb-4">
              <h3 className="font-serif text-sm font-bold tracking-wide">
                2. {t('secEducation', lang)}
              </h3>
              <span className="text-xs font-urdu text-[#E5DFD5]">تعلیمی و پیشہ ورانہ کوائف</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('degree', lang)} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.degree}
                  onChange={(e) => handleChange('degree', e.target.value)}
                  placeholder={tr('e.g. BS Computer Science (FAST), MBBS (KEMU)', 'مثلاً بی ایس کمپیوٹر سائنس، ایم بی بی ایس')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('educationLevel', lang)} *
                </label>
                <select
                  value={formData.educationLevel}
                  onChange={(e) => handleChange('educationLevel', e.target.value as EducationLevel)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                >
                  {EDUCATION_LEVEL_OPTIONS.map(ed => (
                    <option key={ed.value} value={ed.value}>
                      {lang === 'ur' ? ed.labelUr : ed.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('profession', lang)} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.profession}
                  onChange={(e) => handleChange('profession', e.target.value)}
                  placeholder={tr('e.g. Software Engineer, Doctor, Chartered Accountant', 'مثلاً سافٹ ویئر انجینئر، ڈاکٹر، چارٹرڈ اکاؤنٹنٹ')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('designation', lang)}
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                  placeholder={tr('e.g. Senior Manager, Principal Architect', 'مثلاً سینئر مینیجر، پرنسپل آرکیٹیکٹ')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('monthlyIncome', lang)} (PKR)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={formData.monthlyIncome}
                  onChange={(e) => handleChange('monthlyIncome', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('businessAddress', lang)}
                </label>
                <input
                  type="text"
                  value={formData.businessNameAddress}
                  onChange={(e) => handleChange('businessNameAddress', e.target.value)}
                  placeholder={tr('Company name / Business premises', 'کمپنی کا نام / کاروباری پتہ')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Family Details */}
          <div>
            <div className="bg-[#800F2F] text-[#F8F5F0] px-4 py-2 rounded-lg flex items-center justify-between mb-4">
              <h3 className="font-serif text-sm font-bold tracking-wide">
                3. {t('secFamily', lang)}
              </h3>
              <span className="text-xs font-urdu text-[#E5DFD5]">خاندانی پس منظر و مذہب</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('fatherName', lang)} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fatherName}
                  onChange={(e) => handleChange('fatherName', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('fatherOccupation', lang)} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fatherOccupation}
                  onChange={(e) => handleChange('fatherOccupation', e.target.value)}
                  placeholder={tr('e.g. Govt Officer, Businessman, Landlord', 'مثلاً سرکاری افسر، کاروباری، زمیندار')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('motherName', lang)} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.motherName}
                  onChange={(e) => handleChange('motherName', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('motherOccupation', lang)}
                </label>
                <input
                  type="text"
                  value={formData.motherOccupation}
                  onChange={(e) => handleChange('motherOccupation', e.target.value)}
                  placeholder={tr('e.g. Homemaker, Teacher, Doctor', 'مثلاً گھریلو خاتون، استاد، ڈاکٹر')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('caste', lang)} *
                </label>
                <select
                  value={formData.caste}
                  onChange={(e) => handleChange('caste', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none font-medium"
                >
                  {COMMON_CASTES.filter(c => c !== 'Any').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('maslak', lang)} *
                </label>
                <select
                  value={formData.maslak}
                  onChange={(e) => handleChange('maslak', e.target.value as Maslak)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                >
                  {MASLAK_OPTIONS.map(m => (
                    <option key={m.value} value={m.value}>
                      {lang === 'ur' ? m.labelUr : m.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('totalSiblings', lang)}
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.totalSiblings}
                  onChange={(e) => handleChange('totalSiblings', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('marriedSiblings', lang)}
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.marriedSiblingsCount}
                  onChange={(e) => handleChange('marriedSiblingsCount', parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526]"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Partner Preferences */}
          <div>
            <div className="bg-[#800F2F] text-[#F8F5F0] px-4 py-2 rounded-lg flex items-center justify-between mb-4">
              <h3 className="font-serif text-sm font-bold tracking-wide">
                4. {t('secPreferences', lang)}
              </h3>
              <span className="text-xs font-urdu text-[#E5DFD5]">شریک حیات کی ترجیحات</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('prefAgeRange', lang)} ({tr('Min - Max', 'کم از کم - زیادہ سے زیادہ')})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={18}
                    max={70}
                    value={formData.preferences?.ageMin}
                    onChange={(e) => handlePrefChange('ageMin', parseInt(e.target.value, 10))}
                    className="w-1/2 px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
                  />
                  <span>{tr('to', 'سے')}</span>
                  <input
                    type="number"
                    min={18}
                    max={70}
                    value={formData.preferences?.ageMax}
                    onChange={(e) => handlePrefChange('ageMax', parseInt(e.target.value, 10))}
                    className="w-1/2 px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('prefEducationMin', lang)}
                </label>
                <select
                  value={formData.preferences?.educationMin}
                  onChange={(e) => handlePrefChange('educationMin', e.target.value as EducationLevel)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
                >
                  {EDUCATION_LEVEL_OPTIONS.map(ed => (
                    <option key={ed.value} value={ed.value}>
                      {lang === 'ur' ? ed.labelUr : ed.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('prefCastes', lang)}
                </label>
                <select
                  value={formData.preferences?.castes?.[0] || 'Any'}
                  onChange={(e) => handlePrefChange('castes', [e.target.value])}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
                >
                  {COMMON_CASTES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('prefMaslak', lang)}
                </label>
                <select
                  value={formData.preferences?.maslak}
                  onChange={(e) => handlePrefChange('maslak', e.target.value as Maslak)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
                >
                  {MASLAK_OPTIONS.map(m => (
                    <option key={m.value} value={m.value}>
                      {lang === 'ur' ? m.labelUr : m.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('prefOtherNotes', lang)}
                </label>
                <textarea
                  rows={2}
                  value={formData.preferences?.otherNotes || ''}
                  onChange={(e) => handlePrefChange('otherNotes', e.target.value)}
                  placeholder={tr('Describe your family values, relocation flexibility, expectations...', 'اپنی خاندانی اقدار، شہر کی تبدیلی یا دیگر توقعات بیان کریں...')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526]"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Contact Information */}
          <div>
            <div className="bg-[#800F2F] text-[#F8F5F0] px-4 py-2 rounded-lg flex items-center justify-between mb-4">
              <h3 className="font-serif text-sm font-bold tracking-wide">
                5. {t('secContact', lang)}
              </h3>
              <span className="text-[11px] text-[#D4AF37]">
                {isPublic ? tr('Kept 100% Confidential', '100٪ خفیہ رکھا جاتا ہے') : tr('Internal Staff Only', 'صرف عملے کے لیے')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('phone', lang)} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="0300 1234567"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('whatsapp', lang)} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => handleChange('whatsapp', e.target.value)}
                  placeholder="0300 1234567"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('guardianName', lang)}
                </label>
                <input
                  type="text"
                  value={formData.guardianName}
                  onChange={(e) => handleChange('guardianName', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('guardianPhone', lang)}
                </label>
                <input
                  type="text"
                  value={formData.guardianPhone}
                  onChange={(e) => handleChange('guardianPhone', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                  {t('address', lang)} *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder={tr('House number, Street, Sector, City', 'مکان نمبر، گلی، سیکٹر، شہر')}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526]"
                />
              </div>

              {!isPublic && (
                <div>
                  <label className="block text-xs font-semibold text-[#800F2F] mb-1">
                    {t('cnic', lang)} ({tr('Admin Eyes Only', 'صرف ایڈمن کے لیے')})
                  </label>
                  <input
                    type="text"
                    value={formData.cnic}
                    onChange={(e) => handleChange('cnic', e.target.value)}
                    placeholder="35202-xxxxxxx-x"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 7: Internal Remarks (Hidden on public) */}
          {!isPublic && (
            <div>
              <div className="bg-[#660A22] text-[#D4AF37] px-4 py-2 rounded-lg flex items-center justify-between mb-4">
                <h3 className="font-serif text-sm font-bold tracking-wide">
                  6. {t('secRemarks', lang)}
                </h3>
                <span className="text-[11px] text-[#E5DFD5]">
                  {tr('Never shown to clients or in WhatsApp summaries', 'کلائنٹس یا واٹس ایپ خلاصے میں کبھی ظاہر نہیں کیا جاتا')}
                </span>
              </div>

              <textarea
                rows={3}
                value={formData.remarks || ''}
                onChange={(e) => handleChange('remarks', e.target.value)}
                placeholder={tr('Internal verification notes, family status, financial assessment...', 'اندرونی تصدیقی نوٹس، خاندانی حیثیت، مالی جائزہ...')}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526]"
              />
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-4 border-t border-[#E5DFD5] flex items-center justify-between">
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
              icon={<Save className="w-4 h-4 text-[#D4AF37]" />}
            >
              {submitting
                ? tr('Saving...', 'محفوظ ہو رہا ہے...')
                : isPublic
                  ? tr('Submit Online Registration', 'آن لائن رجسٹریشن جمع کرائیں')
                  : initialData?.id
                    ? tr('Save Profile Changes', 'تبدیلیاں محفوظ کریں')
                    : tr('Save & Enter Matching Engine', 'محفوظ کریں اور میچنگ میں شامل کریں')}
            </Button>
          </div>
        </div>
      </form>

      {/* Real-time Debounced Side Panel (Section 6 of requirements) */}
      <div className="lg:col-span-4 sticky top-24">
        <EntrySidePanel
          currentFormValues={formData}
          savedProfileId={initialData?.id}
          hasEnteredData={hasInteracted || Boolean(formData.name?.trim() || formData.phone?.trim() || formData.degree?.trim())}
        />
      </div>
    </div>
  );
}

