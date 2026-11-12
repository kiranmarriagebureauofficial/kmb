'use client';

import React, { useState, useEffect } from 'react';
import { store } from '@/lib/db/store';
import { BureauSettings, StaffUser } from '@/lib/types';
import { formatPKR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { 
  Settings, 
  Save, 
  ShieldCheck, 
  Users, 
  Scale, 
  Sliders, 
  Receipt, 
  Lock, 
  Plus, 
  UserCheck, 
  UserX,
  RotateCcw
} from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

export default function AdminSettingsPage() {
  const { tr } = useLanguage();
  const [settings, setSettings] = useState<BureauSettings>(store.getSettings());
  const [staffList, setStaffList] = useState<StaffUser[]>(store.getStaff());
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New staff modal state
  const [newStaffModal, setNewStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'admin' | 'staff'>('staff');
  const [newStaffPhone, setNewStaffPhone] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setSettings(store.getSettings());
      setStaffList(store.getStaff());
      setCurrentUser(store.getCurrentUser());
    });
    return unsub;
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleToggleHardFilter = (key: keyof BureauSettings['matching']['hardFilters']) => {
    setSettings(prev => ({
      ...prev,
      matching: {
        ...prev.matching,
        hardFilters: {
          ...prev.matching.hardFilters,
          [key]: !prev.matching.hardFilters[key],
        },
      },
    }));
  };

  const handleWeightChange = (key: keyof BureauSettings['matching']['weights'], val: number) => {
    setSettings(prev => ({
      ...prev,
      matching: {
        ...prev.matching,
        weights: {
          ...prev.matching.weights,
          [key]: val,
        },
      },
    }));
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffEmail || !newStaffName) return;

    store.addStaffUser({
      name: newStaffName,
      email: newStaffEmail,
      role: newStaffRole,
      phone: newStaffPhone,
      active: true,
    });

    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffPhone('');
    setNewStaffModal(false);
  };

  const handleToggleStaffStatus = (id: string) => {
    store.toggleStaffStatus(id);
  };

  const totalWeights = Object.values(settings.matching.weights).reduce((a, b) => a + b, 0);

  const hardFilterLabels: Record<string, [string, string]> = {
    gender: ['Gender Opposite Match', 'جنس کی مطابقت'],
    maslak: ['Maslak / Sect Exact Match', 'مسلک کی مطابقت'],
    maritalStatus: ['Marital Status Filter', 'ازدواجی حیثیت فلٹر'],
    caste: ['Caste / Biradari Filter', 'ذات / برادری فلٹر'],
    city: ['City / Location Filter', 'شہر / مقام فلٹر'],
    education: ['Education Minimum Filter', 'کم از کم تعلیم فلٹر'],
    income: ['Income Minimum Filter', 'کم از کم آمدنی فلٹر'],
  };

  const weightLabels: Record<string, [string, string]> = {
    ageCompatibility: ['Age Compatibility', 'عمر کی مطابقت'],
    cityMatch: ['City / Area Match', 'شہر / علاقہ میچ'],
    casteMatch: ['Caste Match', 'ذات میچ'],
    maslakMatch: ['Maslak Match', 'مسلک میچ'],
    educationMatch: ['Education Match', 'تعلیم میچ'],
    incomeMatch: ['Income & Stability', 'آمدنی و معاشی حیثیت'],
    familySystemMatch: ['Family System', 'خاندانی نظام'],
    maritalStatusMatch: ['Marital Status', 'ازدواجی حیثیت'],
    heightMatch: ['Height Match', 'قد کی مطابقت'],
    professionMatch: ['Profession Match', 'پیشہ کی مطابقت'],
    locationMatch: ['Location Match', 'علاقہ میچ'],
    religiousMatch: ['Religious Alignment', 'مذہبی ہم آہنگی'],
    age: ['Age', 'عمر'],
    city: ['City', 'شہر'],
    caste: ['Caste', 'ذات'],
    education: ['Education', 'تعلیم'],
    income: ['Income', 'آمدنی'],
    familySystem: ['Family System', 'خاندانی نظام'],
    height: ['Height', 'قد'],
    maslak: ['Maslak', 'مسلک'],
    profession: ['Profession', 'پیشہ'],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5DFD5] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-serif font-bold tracking-widest text-[#B88B22]">
            {tr('System Administration', 'سسٹم انتظامیہ')}
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#800F2F] mt-0.5">
            {tr('Bureau & Matching Engine Configuration', 'بیورو اور میچنگ انجن کی سیٹنگز')}
          </h1>
          <p className="text-xs text-[#6E6466]">
            {tr(
              'Configure bureau details, official fee amounts, hard filter toggles, scoring weights, and staff accounts.',
              'بیورو کی تفصیلات، سرکاری فیسیں، سخت فلٹرز، سکورنگ وزن اور عملے کے اکاؤنٹس ترتیب دیں۔'
            )}
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1.5 rounded-lg bg-[#F8F5F0] text-[#800F2F] border border-[#D4AF37] font-bold text-xs">
            ✓ {tr('Settings Saved Successfully!', 'سیٹنگز کامیابی سے محفوظ ہو گئیں!')}
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Bureau Identity & Contact */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5DFD5] pb-3 text-[#800F2F]">
            <Settings className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-serif text-base font-bold">
              {tr('1. Official Bureau Identity & Contact Numbers', '1. بیورو کی سرکاری شناخت اور رابطہ نمبرز')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">{tr('Bureau Legal Name', 'بیورو کا قانونی نام')}</label>
              <input
                type="text"
                value={settings.bureauName}
                onChange={(e) => setSettings({ ...settings, bureauName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">{tr('Official WhatsApp', 'آفیشل واٹس ایپ')}</label>
              <input
                type="text"
                dir="ltr"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">{tr('Telephone Line 1', 'فون نمبر 1')}</label>
              <input
                type="text"
                dir="ltr"
                value={settings.phone1}
                onChange={(e) => setSettings({ ...settings, phone1: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">{tr('Telephone Line 2', 'فون نمبر 2')}</label>
              <input
                type="text"
                dir="ltr"
                value={settings.phone2}
                onChange={(e) => setSettings({ ...settings, phone2: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#800F2F] mb-1">{tr('Office Address (Printed on Invoices & Forms)', 'آفس کا پتہ (انوائس اور فارمز پر پرنٹ ہوتا ہے)')}</label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526]"
              />
            </div>
          </div>
        </div>

        {/* Section 1B: Online Registration Link & Stock Settings */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5DFD5] pb-3 text-[#800F2F]">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-serif text-base font-bold">
              {tr('1B. Online Registration Portal & Stock Velocity Settings', '1B. آن لائن رجسٹریشن لنک اور اسٹاک الرٹ سیٹنگز')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-[#F8F5F0] rounded-xl border border-[#E5DFD5] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#800F2F] block">{tr('Enable Public Registration Link (/register)', 'عوامی رجسٹریشن لنک (/register) فعال کریں')}</span>
                <span className="text-[11px] text-[#6E6466]">{tr('When disabled, families visiting the link see an office notice', 'بند ہونے پر لنک کھولنے والوں کو آفس کا پیغام نظر آئے گا')}</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableOnlineRegistrationLink !== false}
                onChange={(e) => setSettings({ ...settings, enableOnlineRegistrationLink: e.target.checked })}
                className="w-5 h-5 text-[#800F2F] accent-[#800F2F]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">{tr('Old Stock Alert Threshold (Days Sitting Unmatched)', 'پرانے اسٹاک الرٹ کی حد (بغیر میچ دن)')}</label>
              <input
                type="number"
                min={30}
                max={365}
                value={settings.oldStockAlertDays || 90}
                onChange={(e) => setSettings({ ...settings, oldStockAlertDays: parseInt(e.target.value, 10) || 90 })}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] font-bold"
              />
              <span className="text-[10px] text-[#6E6466] mt-1 block">{tr('Profiles older than this trigger Old Stock KPI alerts', 'اس سے پرانے پروفائلز پر پرانے اسٹاک کا الرٹ ظاہر ہوتا ہے')}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Fee Defaults */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5DFD5] pb-3 text-[#800F2F]">
            <Receipt className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-serif text-base font-bold">
              {tr('2. Standard Matrimonial Fee Amounts (PKR)', '2. معیاری فیس کی رقمیں (روپے میں)')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">{tr('Standard Registration Fee', 'عام رجسٹریشن فیس')}</label>
              <input
                type="number"
                step={1000}
                value={settings.feeDefaults.registrationFee}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    feeDefaults: { ...settings.feeDefaults, registrationFee: parseInt(e.target.value, 10) },
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] font-mono font-bold text-[#800F2F]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">{tr('6-Month Premium Membership Fee', '6 ماہ کی پریمیم ممبرشپ فیس')}</label>
              <input
                type="number"
                step={5000}
                value={settings.feeDefaults.premiumMembershipFee}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    feeDefaults: { ...settings.feeDefaults, premiumMembershipFee: parseInt(e.target.value, 10) },
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] font-mono font-bold text-[#B88B22]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">{tr('Success Fee (Rishta Done)', 'شادی طے ہونے کی فیس (سکسس فیس)')}</label>
              <input
                type="number"
                step={5000}
                value={settings.feeDefaults.successFee}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    feeDefaults: { ...settings.feeDefaults, successFee: parseInt(e.target.value, 10) },
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] font-mono font-bold text-[#800F2F]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Matching Engine Hard Filters (Toggle on/off) */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3 text-[#800F2F]">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-serif text-base font-bold">
                {tr('3. Matching Engine Hard Filters (Zero Tolerance Gates)', '3. میچنگ انجن کے سخت فلٹرز (لازمی شرائط)')}
              </h2>
            </div>
            <span className="text-[11px] text-[#6E6466]">{tr('If unchecked, field is relaxed to soft scoring', 'ان چیک ہونے پر اس شرط میں نرمی برتی جائے گی')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {Object.entries(settings.matching.hardFilters).map(([k, enabled]) => {
              const pair = hardFilterLabels[k];
              return (
                <label
                  key={k}
                  className="p-3 rounded-xl border border-[#E5DFD5] bg-[#F8F5F0] flex items-center justify-between cursor-pointer hover:border-[#D4AF37] transition-colors"
                >
                  <span className="font-semibold text-[#2C2526] capitalize">
                    {pair ? tr(pair[0], pair[1]) : k.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => handleToggleHardFilter(k as any)}
                    className="w-4 h-4 text-[#800F2F] rounded border-[#E5DFD5]"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Section 4: Scoring Weights (Sum = 100) */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3 text-[#800F2F]">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-serif text-base font-bold">
                {tr('4. Compatibility Score Weights (Total Must Equal 100)', '4. مطابقت سکورنگ کے وزن (مجموعہ 100 ہونا ضروری ہے)')}
              </h2>
            </div>
            <span className={`text-xs font-mono font-bold ${totalWeights === 100 ? 'text-[#800F2F]' : 'text-[#A3182E]'}`}>
              {tr('Current Total:', 'موجودہ مجموعہ:')} {totalWeights} / 100
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {Object.entries(settings.matching.weights).map(([k, weight]) => {
              const pair = weightLabels[k];
              return (
                <div key={k} className="p-3 bg-[#F8F5F0] rounded-xl border border-[#E5DFD5]">
                  <label className="block text-[11px] font-semibold text-[#800F2F] mb-1 capitalize truncate">
                    {pair ? tr(pair[0], pair[1]) : k.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={weight}
                    onChange={(e) => handleWeightChange(k as any, parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2.5 py-1.5 rounded border border-[#E5DFD5] bg-white font-mono font-bold text-[#800F2F]"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 5: Tier Thresholds */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5DFD5] pb-3 text-[#800F2F]">
            <Sliders className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-serif text-base font-bold">
              {tr('5. Tier Threshold Boundaries', '5. مطابقت درجات کی حدود')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">
                {tr('Minimum Score to Show (Default: 50%)', 'دکھانے کا کم از کم سکور (ڈیفالٹ: 50%)')}
              </label>
              <input
                type="number"
                min={30}
                max={70}
                value={settings.matching.tierThresholds.minScoreToShow}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    matching: {
                      ...settings.matching,
                      tierThresholds: {
                        ...settings.matching.tierThresholds,
                        minScoreToShow: parseInt(e.target.value, 10),
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] font-mono font-bold"
              />
              <span className="text-[10px] text-[#6E6466] mt-1 block">{tr('Matches below this % are hidden', 'اس فیصد سے کم میچز چھپائے جاتے ہیں')}</span>
            </div>

            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">
                {tr('Premium Rishtay Minimum Score (Default: 75%+)', 'پریمیم رشتوں کا کم از کم سکور (ڈیفالٹ: 75%+)')}
              </label>
              <input
                type="number"
                min={65}
                max={90}
                value={settings.matching.tierThresholds.premiumScoreMin}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    matching: {
                      ...settings.matching,
                      tierThresholds: {
                        ...settings.matching.tierThresholds,
                        premiumScoreMin: parseInt(e.target.value, 10),
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] font-mono font-bold text-[#B88B22]"
              />
              <span className="text-[10px] text-[#6E6466] mt-1 block">{tr('Pairs at or above this score are awarded Gold Ring & Star', 'اس یا اس سے زیادہ سکور والے جوڑوں کو سنہری ستارہ ملتا ہے')}</span>
            </div>
          </div>
        </div>

        {/* Section 6: Staff Management */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5DFD5] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3 text-[#800F2F]">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-serif text-base font-bold">
                {tr('6. Staff & Admin Access Management', '6. عملہ اور ایڈمن رسائی کا انتظام')}
              </h2>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setNewStaffModal(true)}
              icon={<Plus className="w-3.5 h-3.5 text-[#800F2F]" />}
            >
              {tr('Add Staff Member', 'نیا عملہ شامل کریں')}
            </Button>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-start">
              <thead className="bg-[#F8F5F0] text-[#6E6466] uppercase font-semibold">
                <tr>
                  <th className="p-2.5">{tr('Name', 'نام')}</th>
                  <th className="p-2.5">{tr('Email', 'ای میل')}</th>
                  <th className="p-2.5">{tr('Role', 'عہدہ')}</th>
                  <th className="p-2.5">{tr('Phone', 'فون')}</th>
                  <th className="p-2.5">{tr('Status', 'اسٹیٹس')}</th>
                  <th className="p-2.5 text-end">{tr('Toggle', 'تبدیلی')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DFD5]">
                {staffList.map(st => (
                  <tr key={st.id}>
                    <td className="p-2.5 font-bold text-[#2C2526]">{st.name}</td>
                    <td className="p-2.5 text-[#6E6466]" dir="ltr">{st.email}</td>
                    <td className="p-2.5">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-[#800F2F] text-[#D4AF37]">
                        {st.role === 'admin' ? tr('Admin', 'ایڈمن') : tr('Staff', 'عملہ')}
                      </span>
                    </td>
                    <td className="p-2.5" dir="ltr">{st.phone || tr('N/A', 'موجود نہیں')}</td>
                    <td className="p-2.5">
                      {st.active ? (
                        <span className="text-[#800F2F] font-bold">{tr('Active', 'فعال')}</span>
                      ) : (
                        <span className="text-[#A3182E]">{tr('Disabled', 'غیر فعال')}</span>
                      )}
                    </td>
                    <td className="p-2.5 text-end">
                      <button
                        type="button"
                        onClick={() => handleToggleStaffStatus(st.id)}
                        className="text-[11px] underline font-semibold text-[#800F2F]"
                      >
                        {st.active ? tr('Disable', 'بند کریں') : tr('Enable', 'فعال کریں')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E5DFD5] flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (confirm(tr('Clear all rishtas, proposals, and invoices for a clean fresh start?', 'کیا آپ نئے آغاز کے لیے تمام رشتے، پروپوزلز اور انوائسز صاف کرنا چاہتے ہیں؟'))) {
                store.resetToDefaults();
                alert(tr('All bureau data cleared cleanly.', 'تمام بیورو ڈیٹا صاف کر دیا گیا ہے۔'));
              }
            }}
            icon={<RotateCcw className="w-3.5 h-3.5 text-[#A3182E]" />}
          >
            {tr('Clear All Bureau Data (Fresh Start)', 'تمام ڈیٹا صاف کریں (نیا آغاز)')}
          </Button>

          <Button
            type="submit"
            variant="primary"
            icon={<Save className="w-4 h-4 text-[#D4AF37]" />}
          >
            {tr('Save All Settings', 'تمام سیٹنگز محفوظ کریں')}
          </Button>
        </div>
      </form>

      {/* Add Staff Modal */}
      {newStaffModal && (
        <div className="fixed inset-0 z-50 bg-[#2C2526]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="font-serif text-base font-bold text-[#800F2F]">
              {tr('Add New Bureau Staff Member', 'بیورو کے نئے عملے کا اضافہ')}
            </h3>
            <form onSubmit={handleAddStaff} className="space-y-3">
              <div>
                <label className="block font-semibold text-[#800F2F] mb-1">{tr('Full Name', 'مکمل نام')}</label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder={tr('e.g. Mrs. Saima Nadeem', 'مثال: مسز صائمہ ندیم')}
                  className="w-full p-2 rounded border border-[#E5DFD5] bg-[#F8F5F0]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#800F2F] mb-1">{tr('Official Email', 'آفیشل ای میل')}</label>
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="saima@kiranmarriagebureau.com"
                  className="w-full p-2 rounded border border-[#E5DFD5] bg-[#F8F5F0]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#800F2F] mb-1">{tr('Role', 'عہدہ')}</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as any)}
                  className="w-full p-2 rounded border border-[#E5DFD5] bg-[#F8F5F0]"
                >
                  <option value="staff">{tr('Staff (Intake, Matching, Invoices)', 'عملہ (اندراج، میچنگ، انوائسز)')}</option>
                  <option value="admin">{tr('Admin (All Access, Delete, Settings)', 'ایڈمن (مکمل اختیار، حذف، سیٹنگز)')}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#800F2F] mb-1">{tr('Phone', 'فون نمبر')}</label>
                <input
                  type="text"
                  dir="ltr"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  placeholder="+92 300 0000000"
                  className="w-full p-2 rounded border border-[#E5DFD5] bg-[#F8F5F0]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5DFD5]">
                <Button size="sm" variant="secondary" onClick={() => setNewStaffModal(false)}>
                  {tr('Cancel', 'منسوخ')}
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  {tr('Add User', 'صارف شامل کریں')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

