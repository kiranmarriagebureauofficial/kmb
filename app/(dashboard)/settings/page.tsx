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

export default function AdminSettingsPage() {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#FFFDF8] p-5 rounded-2xl border border-[#E9DDC3] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-serif font-bold tracking-widest text-[#B08626]">
            System Administration
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#5A0A14] mt-0.5">
            Bureau & Matching Engine Configuration
          </h1>
          <p className="text-xs text-[#7B5E5E]">
            Configure bureau details, official fee amounts, hard filter toggles, scoring weights, and staff accounts.
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1.5 rounded-lg bg-[#FBF4E6] text-[#5A0A14] border border-[#D9A93F] font-bold text-xs">
            ✓ Settings Saved Successfully!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Bureau Identity & Contact */}
        <div className="bg-[#FFFDF8] rounded-2xl border border-[#E9DDC3] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E9DDC3] pb-3 text-[#5A0A14]">
            <Settings className="w-5 h-5 text-[#D9A93F]" />
            <h2 className="font-serif text-base font-bold">
              1. Official Bureau Identity & Contact Numbers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#5A0A14] mb-1">Bureau Legal Name</label>
              <input
                type="text"
                value={settings.bureauName}
                onChange={(e) => setSettings({ ...settings, bureauName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5A0A14] mb-1">Official WhatsApp</label>
              <input
                type="text"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5A0A14] mb-1">Telephone Line 1</label>
              <input
                type="text"
                value={settings.phone1}
                onChange={(e) => setSettings({ ...settings, phone1: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5A0A14] mb-1">Telephone Line 2</label>
              <input
                type="text"
                value={settings.phone2}
                onChange={(e) => setSettings({ ...settings, phone2: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#5A0A14] mb-1">Office Address (Printed on Invoices & Forms)</label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F]"
              />
            </div>
          </div>
        </div>

        {/* Section 1B: Online Registration Link & Stock Settings */}
        <div className="bg-[#FFFDF8] rounded-2xl border border-[#E9DDC3] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E9DDC3] pb-3 text-[#5A0A14]">
            <ShieldCheck className="w-5 h-5 text-[#D9A93F]" />
            <h2 className="font-serif text-base font-bold">
              1B. Online Registration Portal & Stock Velocity Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-[#FBF4E6] rounded-xl border border-[#E9DDC3] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#5A0A14] block">Enable Public Registration Link (/register)</span>
                <span className="text-[11px] text-[#7B5E5E]">When disabled, families visiting the link see an office notice</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableOnlineRegistrationLink !== false}
                onChange={(e) => setSettings({ ...settings, enableOnlineRegistrationLink: e.target.checked })}
                className="w-5 h-5 text-[#5A0A14] accent-[#5A0A14]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5A0A14] mb-1">Old Stock Alert Threshold (Days Sitting Unmatched)</label>
              <input
                type="number"
                min={30}
                max={365}
                value={settings.oldStockAlertDays || 90}
                onChange={(e) => setSettings({ ...settings, oldStockAlertDays: parseInt(e.target.value, 10) || 90 })}
                className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F] font-bold"
              />
              <span className="text-[10px] text-[#7B5E5E] mt-1 block">Profiles older than this trigger Old Stock KPI alerts</span>
            </div>
          </div>
        </div>

        {/* Section 2: Fee Defaults */}
        <div className="bg-[#FFFDF8] rounded-2xl border border-[#E9DDC3] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E9DDC3] pb-3 text-[#5A0A14]">
            <Receipt className="w-5 h-5 text-[#D9A93F]" />
            <h2 className="font-serif text-base font-bold">
              2. Standard Matrimonial Fee Amounts (PKR)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#5A0A14] mb-1">Standard Registration Fee</label>
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
                className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] font-mono font-bold text-[#5A0A14]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5A0A14] mb-1">6-Month Premium Membership Fee</label>
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
                className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] font-mono font-bold text-[#B08626]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5A0A14] mb-1">Success Fee (Rishta Done)</label>
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
                className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] font-mono font-bold text-[#5A0A14]"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Matching Engine Hard Filters (Toggle on/off) */}
        <div className="bg-[#FFFDF8] rounded-2xl border border-[#E9DDC3] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E9DDC3] pb-3 text-[#5A0A14]">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#D9A93F]" />
              <h2 className="font-serif text-base font-bold">
                3. Matching Engine Hard Filters (Zero Tolerance Gates)
              </h2>
            </div>
            <span className="text-[11px] text-[#7B5E5E]">If unchecked, field is relaxed to soft scoring</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {Object.entries(settings.matching.hardFilters).map(([k, enabled]) => (
              <label
                key={k}
                className="p-3 rounded-xl border border-[#E9DDC3] bg-[#FBF4E6] flex items-center justify-between cursor-pointer hover:border-[#D9A93F] transition-colors"
              >
                <span className="font-semibold text-[#2A0A0F] capitalize">
                  {k.replace(/([A-Z])/g, ' $1')}
                </span>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => handleToggleHardFilter(k as any)}
                  className="w-4 h-4 text-[#5A0A14] rounded border-[#E9DDC3]"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Section 4: Scoring Weights (Sum = 100) */}
        <div className="bg-[#FFFDF8] rounded-2xl border border-[#E9DDC3] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E9DDC3] pb-3 text-[#5A0A14]">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#D9A93F]" />
              <h2 className="font-serif text-base font-bold">
                4. Compatibility Score Weights (Total Must Equal 100)
              </h2>
            </div>
            <span className={`text-xs font-mono font-bold ${totalWeights === 100 ? 'text-[#5A0A14]' : 'text-[#8E1B2B]'}`}>
              Current Total: {totalWeights} / 100
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {Object.entries(settings.matching.weights).map(([k, weight]) => (
              <div key={k} className="p-3 bg-[#FBF4E6] rounded-xl border border-[#E9DDC3]">
                <label className="block text-[11px] font-semibold text-[#5A0A14] mb-1 capitalize truncate">
                  {k.replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={weight}
                  onChange={(e) => handleWeightChange(k as any, parseInt(e.target.value, 10) || 0)}
                  className="w-full px-2.5 py-1.5 rounded border border-[#E9DDC3] bg-white font-mono font-bold text-[#5A0A14]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Tier Thresholds */}
        <div className="bg-[#FFFDF8] rounded-2xl border border-[#E9DDC3] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E9DDC3] pb-3 text-[#5A0A14]">
            <Sliders className="w-5 h-5 text-[#D9A93F]" />
            <h2 className="font-serif text-base font-bold">
              5. Tier Threshold Boundaries
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#5A0A14] mb-1">
                Minimum Score to Show (Default: 50%)
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
                className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] font-mono font-bold"
              />
              <span className="text-[10px] text-[#7B5E5E] mt-1 block">Matches below this % are hidden</span>
            </div>

            <div>
              <label className="block font-semibold text-[#5A0A14] mb-1">
                Premium Rishtay Minimum Score (Default: 75%+)
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
                className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] font-mono font-bold text-[#B08626]"
              />
              <span className="text-[10px] text-[#7B5E5E] mt-1 block">Pairs at or above this score are awarded Gold Ring & Star</span>
            </div>
          </div>
        </div>

        {/* Section 6: Staff Management */}
        <div className="bg-[#FFFDF8] rounded-2xl border border-[#E9DDC3] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E9DDC3] pb-3 text-[#5A0A14]">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#D9A93F]" />
              <h2 className="font-serif text-base font-bold">
                6. Staff & Admin Access Management
              </h2>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setNewStaffModal(true)}
              icon={<Plus className="w-3.5 h-3.5 text-[#5A0A14]" />}
            >
              Add Staff Member
            </Button>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-[#FBF4E6] text-[#7B5E5E] uppercase font-semibold">
                <tr>
                  <th className="p-2.5">Name</th>
                  <th className="p-2.5">Email</th>
                  <th className="p-2.5">Role</th>
                  <th className="p-2.5">Phone</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DDC3]">
                {staffList.map(st => (
                  <tr key={st.id}>
                    <td className="p-2.5 font-bold text-[#2A0A0F]">{st.name}</td>
                    <td className="p-2.5 text-[#7B5E5E]">{st.email}</td>
                    <td className="p-2.5">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-[#5A0A14] text-[#D9A93F]">
                        {st.role}
                      </span>
                    </td>
                    <td className="p-2.5">{st.phone || 'N/A'}</td>
                    <td className="p-2.5">
                      {st.active ? (
                        <span className="text-[#5A0A14] font-bold">Active</span>
                      ) : (
                        <span className="text-[#8E1B2B]">Disabled</span>
                      )}
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleStaffStatus(st.id)}
                        className="text-[11px] underline font-semibold text-[#5A0A14]"
                      >
                        {st.active ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="p-4 bg-[#FFFDF8] rounded-xl border border-[#E9DDC3] flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (confirm('Reset all demo data back to default seed?')) {
                store.resetToDefaults();
                alert('Database reset to fresh Pakistani seed profiles.');
              }
            }}
            icon={<RotateCcw className="w-3.5 h-3.5 text-[#8E1B2B]" />}
          >
            Reset to Seed Defaults
          </Button>

          <Button
            type="submit"
            variant="primary"
            icon={<Save className="w-4 h-4 text-[#D9A93F]" />}
          >
            Save All Settings
          </Button>
        </div>
      </form>

      {/* Add Staff Modal */}
      {newStaffModal && (
        <div className="fixed inset-0 z-50 bg-[#2A0A0F]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] border border-[#E9DDC3] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="font-serif text-base font-bold text-[#5A0A14]">
              Add New Bureau Staff Member
            </h3>
            <form onSubmit={handleAddStaff} className="space-y-3">
              <div>
                <label className="block font-semibold text-[#5A0A14] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Mrs. Saima Nadeem"
                  className="w-full p-2 rounded border border-[#E9DDC3] bg-[#FBF4E6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5A0A14] mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="saima@kiranmarriagebureau.com"
                  className="w-full p-2 rounded border border-[#E9DDC3] bg-[#FBF4E6]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#5A0A14] mb-1">Role</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as any)}
                  className="w-full p-2 rounded border border-[#E9DDC3] bg-[#FBF4E6]"
                >
                  <option value="staff">Staff (Intake, Matching, Invoices)</option>
                  <option value="admin">Admin (All Access, Delete, Settings)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#5A0A14] mb-1">Phone</label>
                <input
                  type="text"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  placeholder="+92 300 0000000"
                  className="w-full p-2 rounded border border-[#E9DDC3] bg-[#FBF4E6]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E9DDC3]">
                <Button size="sm" variant="secondary" onClick={() => setNewStaffModal(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Add User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

