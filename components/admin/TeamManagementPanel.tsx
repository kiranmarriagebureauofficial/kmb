'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { store } from '@/lib/db/store';
import type { ApprovalStatus, StaffUser, UserPermissions, UserRole } from '@/lib/types';
import { useLanguage } from '@/lib/useLanguage';
import { formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
  Users,
  Plus,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  KeyRound,
  Trash2,
  Sliders,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
} from 'lucide-react';

export function TeamManagementPanel() {
  const { tr } = useLanguage();
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(store.getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add User modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>('staff');
  const [newApprovalStatus, setNewApprovalStatus] = useState<ApprovalStatus>('approved');
  const [newPerms, setNewPerms] = useState<UserPermissions>({
    canAddEditData: true,
    canPrintExport: true,
    canManageInvoices: false,
  });
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Edit / Reset Password modal
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('staff');
  const [editPerms, setEditPerms] = useState<UserPermissions>({
    canAddEditData: true,
    canPrintExport: true,
    canManageInvoices: false,
  });
  const [editNewPassword, setEditNewPassword] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Own Admin Credentials modal
  const [credModalOpen, setCredModalOpen] = useState(false);
  const [credName, setCredName] = useState(currentUser?.name || '');
  const [credEmail, setCredEmail] = useState(currentUser?.email || '');
  const [credCurrentPassword, setCredCurrentPassword] = useState('');
  const [credNewPassword, setCredNewPassword] = useState('');
  const [credSubmitting, setCredSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && Array.isArray(data.users)) {
        setUsers(data.users);
        store.syncStaffFromServer(data.users);
      } else {
        setError(data?.error || tr('Failed to load users.', 'یوزرز لوڈ نہیں ہو سکے۔'));
      }
    } catch {
      setError(tr('Network error loading users.', 'یوزرز لوڈ کرتے وقت نیٹ ورک خرابی۔'));
    } finally {
      setLoading(false);
    }
  }, [tr]);

  useEffect(() => {
    loadUsers();
    const unsub = store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
    });
    return unsub;
  }, [loadUsers]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmittingAdd(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          phone: newPhone,
          password: newPassword,
          role: newRole,
          approvalStatus: newApprovalStatus,
          permissions: newPerms,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || tr('Could not add user.', 'یوزر شامل نہیں ہو سکا۔'));
        setSubmittingAdd(false);
        return;
      }
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewPassword('');
      setNewRole('staff');
      setNewApprovalStatus('approved');
      setNewPerms({ canAddEditData: true, canPrintExport: true, canManageInvoices: false });
      setAddModalOpen(false);
      await loadUsers();
      showSuccess(tr('Team user saved successfully.', 'ٹیم یوزر کامیابی سے محفوظ ہو گیا۔'));
    } catch {
      setError(tr('Network error saving user.', 'یوزر محفوظ کرتے وقت نیٹ ورک خرابی۔'));
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handlePatchUser = async (id: string, payload: Record<string, unknown>, doneMsg: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || tr('Action failed.', 'عمل مکمل نہیں ہو سکا۔'));
        return;
      }
      await loadUsers();
      showSuccess(doneMsg);
    } catch {
      setError(tr('Network error updating user.', 'یوزر اپ ڈیٹ کرتے وقت نیٹ ورک خرابی۔'));
    }
  };

  const handleDeleteUser = async (user: StaffUser) => {
    if (!confirm(tr(`Permanently remove user "${user.name}" (${user.email})?`, `کیا آپ واقعی "${user.name}" (${user.email}) کو مستقل ختم کرنا چاہتے ہیں؟`))) {
      return;
    }
    setError(null);
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || tr('Could not delete user.', 'یوزر حذف نہیں ہو سکا۔'));
        return;
      }
      await loadUsers();
      showSuccess(tr('User removed.', 'یوزر ختم کر دیا گیا۔'));
    } catch {
      setError(tr('Network error removing user.', 'یوزر ختم کرتے وقت نیٹ ورک خرابی۔'));
    }
  };

  const openEditModal = (u: StaffUser) => {
    setEditingUser(u);
    setEditRole(u.role);
    setEditPerms(
      u.permissions || {
        canAddEditData: true,
        canPrintExport: true,
        canManageInvoices: u.role === 'admin',
      }
    );
    setEditNewPassword('');
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmittingEdit(true);
    await handlePatchUser(
      editingUser.id,
      {
        role: editRole,
        permissions: editPerms,
        newPassword: editNewPassword || undefined,
      },
      tr('User permissions & credentials updated.', 'یوزر کے اختیارات اور پاس ورڈ اپ ڈیٹ ہو گئے۔')
    );
    setSubmittingEdit(false);
    setEditingUser(null);
  };

  const handleUpdateOwnCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCredSubmitting(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: credCurrentPassword,
          newName: credName,
          newEmail: credEmail,
          newPassword: credNewPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || tr('Failed to update Admin credentials.', 'ایڈمن آئی ڈی / پاس ورڈ اپ ڈیٹ نہیں ہو سکا۔'));
        setCredSubmitting(false);
        return;
      }
      store.setCurrentUser(data.user);
      setCredCurrentPassword('');
      setCredNewPassword('');
      setCredModalOpen(false);
      await loadUsers();
      showSuccess(tr('Your Admin credentials have been updated.', 'آپ کی ایڈمن آئی ڈی اور پاس ورڈ اپ ڈیٹ ہو گئے ہیں۔'));
    } catch {
      setError(tr('Network error updating credentials.', 'نیٹ ورک خرابی۔'));
    } finally {
      setCredSubmitting(false);
    }
  };

  const approvedCount = users.filter(u => (u.approvalStatus || 'approved') === 'approved' && u.active).length;
  const pendingCount = users.filter(u => u.approvalStatus === 'pending').length;

  return (
    <div className="space-y-5">
      {/* Control Banner */}
      <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5DFD5] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#800F2F] text-[#D4AF37]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#800F2F]">
                {tr('Admin Access & Team User Control', 'ایڈمن کنٹرول اور ٹیم یوزرز کی منظوری')}
              </h2>
              <p className="text-xs text-[#6E6466]">
                {tr(
                  'Self-signup is disabled. Only accounts added & approved by the Admin can log in.',
                  'کوئی یوزر خود اکاؤنٹ نہیں بنا سکتا۔ صرف ایڈمن کے شامل اور منظور کردہ ای میل اکاؤنٹس ہی لاگ ان ہو سکتے ہیں۔'
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setCredName(currentUser?.name || '');
                setCredEmail(currentUser?.email || '');
                setCredModalOpen(true);
              }}
              icon={<KeyRound className="w-3.5 h-3.5 text-[#800F2F]" />}
            >
              {tr('Change Admin ID & Password', 'ایڈمن آئی ڈی اور پاس ورڈ بدلیں')}
            </Button>

            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={() => setAddModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5 text-[#D4AF37]" />}
            >
              {tr('Add User by Email', 'ای میل سے نیا یوزر شامل کریں')}
            </Button>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#F8F5F0] border border-[#E5DFD5]">
            <span className="text-[#6E6466] block">{tr('Total Accounts', 'کل اکاؤنٹس')}</span>
            <span className="font-serif text-xl font-bold text-[#800F2F]">{users.length}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#F8F5F0] border border-[#D4AF37]">
            <span className="text-[#6E6466] block">{tr('Approved & Active', 'منظور شدہ و فعال')}</span>
            <span className="font-serif text-xl font-bold text-[#800F2F]">{approvedCount}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#F8F5F0] border border-[#E5DFD5]">
            <span className="text-[#6E6466] block">{tr('Pending Approval', 'منظوری کے منتظر')}</span>
            <span className="font-serif text-xl font-bold text-[#B88B22]">{pendingCount}</span>
          </div>
          <div className="p-3 rounded-lg bg-[#F8F5F0] border border-[#E5DFD5]">
            <span className="text-[#6E6466] block">{tr('Public Self-Signup', 'عوامی سائن اپ')}</span>
            <span className="font-bold text-[#800F2F]">{tr('Locked (Admin Only)', 'بند (صرف ایڈمن)')}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-[#F8F5F0] border border-[#A3182E] rounded-lg flex items-center gap-2 text-xs text-[#A3182E]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-[#F8F5F0] border border-[#D4AF37] rounded-lg flex items-center gap-2 text-xs text-[#800F2F] font-semibold">
            <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto text-xs border border-[#E5DFD5] rounded-xl">
          <table className="w-full text-start">
            <thead className="bg-[#F8F5F0] text-[#800F2F] uppercase font-bold border-b border-[#E5DFD5]">
              <tr>
                <th className="p-3">{tr('User', 'صارف')}</th>
                <th className="p-3">{tr('Email Login ID', 'ای میل لاگ ان آئی ڈی')}</th>
                <th className="p-3">{tr('Role & Permissions', 'عہدہ اور اختیارات')}</th>
                <th className="p-3">{tr('Approval', 'منظوری')}</th>
                <th className="p-3">{tr('Status', 'اسٹیٹس')}</th>
                <th className="p-3">{tr('Last Login', 'آخری لاگ ان')}</th>
                <th className="p-3 text-end">{tr('Admin Controls', 'ایڈمن کنٹرول')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD5]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-[#6E6466]">
                    {tr('Loading authorized users...', 'یوزرز لوڈ ہو رہے ہیں...')}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-[#6E6466]">
                    {tr('No users found.', 'کوئی یوزر موجود نہیں۔')}
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const approval = u.approvalStatus || 'approved';
                  const isSelf = currentUser?.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-[#F8F5F0]/60">
                      <td className="p-3">
                        <p className="font-bold text-[#2C2526]">
                          {u.name} {isSelf && <span className="text-[10px] text-[#B88B22]">({tr('You', 'آپ')})</span>}
                        </p>
                        {u.phone && <span className="text-[11px] text-[#6E6466]" dir="ltr">{u.phone}</span>}
                      </td>
                      <td className="p-3 font-medium text-[#2C2526]" dir="ltr">{u.email}</td>
                      <td className="p-3 space-y-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-[#800F2F] text-[#D4AF37]' : 'bg-[#F8F5F0] border border-[#E5DFD5] text-[#800F2F]'
                        }`}>
                          <Shield className="w-2.5 h-2.5" />
                          {u.role === 'admin' ? tr('Admin', 'ایڈمن') : tr('Team Member', 'ٹیم ممبر')}
                        </span>
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {(u.role === 'admin' || u.permissions?.canAddEditData !== false) && (
                            <span className="px-1.5 py-0.5 rounded bg-[#FFFFFF] border border-[#E5DFD5] text-[10px] text-[#6E6466]">
                              {tr('Data Entry', 'ڈیٹا انٹری')}
                            </span>
                          )}
                          {(u.role === 'admin' || u.permissions?.canPrintExport !== false) && (
                            <span className="px-1.5 py-0.5 rounded bg-[#FFFFFF] border border-[#E5DFD5] text-[10px] text-[#6E6466]">
                              {tr('Data Print', 'ڈیٹا پرنٹ')}
                            </span>
                          )}
                          {(u.role === 'admin' || u.permissions?.canManageInvoices) && (
                            <span className="px-1.5 py-0.5 rounded bg-[#FFFFFF] border border-[#E5DFD5] text-[10px] text-[#6E6466]">
                              {tr('Invoices', 'رسیدیں')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        {approval === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#800F2F] font-semibold text-[11px]">
                            <CheckCircle className="w-3 h-3 text-[#B88B22]" />
                            {tr('Approved', 'منظور شدہ')}
                          </span>
                        )}
                        {approval === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F8F5F0] border border-[#D4AF37] text-[#800F2F] font-semibold text-[11px]">
                            <Clock className="w-3 h-3 text-[#D4AF37]" />
                            {tr('Pending', 'منظوری باقی')}
                          </span>
                        )}
                        {approval === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F8F5F0] border border-[#A3182E] text-[#A3182E] font-semibold text-[11px]">
                            <XCircle className="w-3 h-3" />
                            {tr('Rejected', 'مسترد')}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {u.active ? (
                          <span className="text-[#800F2F] font-bold">{tr('Active', 'فعال')}</span>
                        ) : (
                          <span className="text-[#A3182E] font-semibold">{tr('Disabled', 'بند')}</span>
                        )}
                      </td>
                      <td className="p-3 text-[11px] text-[#6E6466]">
                        {u.lastLogin ? formatDateTime(u.lastLogin) : tr('Never logged in', 'ابھی لاگ ان نہیں ہوا')}
                      </td>
                      <td className="p-3 text-end">
                        <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                          {approval !== 'approved' && (
                            <button
                              type="button"
                              onClick={() =>
                                handlePatchUser(
                                  u.id,
                                  { approvalStatus: 'approved', active: true },
                                  tr(`${u.name} approved!`, `${u.name} منظور کر لیا گیا!`)
                                )
                              }
                              className="px-2 py-1 rounded bg-[#800F2F] text-[#D4AF37] font-bold hover:bg-[#660A22] inline-flex items-center gap-1"
                            >
                              <UserCheck className="w-3 h-3" />
                              {tr('Approve', 'منظور کریں')}
                            </button>
                          )}
                          {approval === 'pending' && (
                            <button
                              type="button"
                              onClick={() =>
                                handlePatchUser(
                                  u.id,
                                  { approvalStatus: 'rejected', active: false },
                                  tr(`${u.name} rejected.`, `${u.name} مسترد کر دیا گیا۔`)
                                )
                              }
                              className="px-2 py-1 rounded border border-[#A3182E] text-[#A3182E] hover:bg-[#F8F5F0] inline-flex items-center gap-1"
                            >
                              <UserX className="w-3 h-3" />
                              {tr('Reject', 'مسترد')}
                            </button>
                          )}
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() =>
                                handlePatchUser(
                                  u.id,
                                  { active: !u.active },
                                  u.active ? tr('User disabled.', 'یوزر بند کر دیا گیا۔') : tr('User enabled.', 'یوزر فعال کر دیا گیا۔')
                                )
                              }
                              className="px-2 py-1 rounded border border-[#E5DFD5] bg-[#FFFFFF] text-[#800F2F] hover:border-[#D4AF37]"
                            >
                              {u.active ? tr('Disable', 'بند کریں') : tr('Enable', 'فعال کریں')}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            className="px-2 py-1 rounded border border-[#E5DFD5] bg-[#FFFFFF] text-[#2C2526] hover:border-[#D4AF37] inline-flex items-center gap-1"
                            title={tr('Edit Permissions / Reset Password', 'اختیارات یا پاس ورڈ بدلیں')}
                          >
                            <Sliders className="w-3 h-3 text-[#800F2F]" />
                            {tr('Access', 'اختیارات')}
                          </button>
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded border border-[#E5DFD5] text-[#A3182E] hover:bg-[#F8F5F0]"
                              title={tr('Delete User', 'یوزر ختم کریں')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2C2526]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border-2 border-[#D4AF37] rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-base font-bold text-[#800F2F]">
              {tr('Add Team Member by Email', 'ای میل کے ذریعے نیا ٹیم ممبر شامل کریں')}
            </h3>

            <form onSubmit={handleAddUser} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#800F2F] mb-1">
                    {tr('Full Name', 'مکمل نام')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={tr('e.g. Ayesha Tariq', 'مثال: عائشہ طارق')}
                    className="w-full p-2.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#800F2F] mb-1">
                    {tr('Phone (Optional)', 'فون (اختیاری)')}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+92 300 0000000"
                    className="w-full p-2.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#800F2F] mb-1">
                  {tr('Login Email Address', 'لاگ ان ای میل ایڈریس')} *
                </label>
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="team.member@yourdomain.com"
                  className="w-full p-2.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#800F2F] mb-1">
                  {tr('Assigned Password (min 6 chars)', 'لاگ ان پاس ورڈ (کم از کم 6 حروف)')} *
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    dir="ltr"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 pe-9 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-[#6E6466]"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#800F2F] mb-1">
                    {tr('Account Role', 'اکاؤنٹ کا عہدہ')}
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full p-2.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
                  >
                    <option value="staff">{tr('Team Member (Data Entry / Print)', 'ٹیم ممبر (ڈیٹا انٹری / پرنٹ)')}</option>
                    <option value="admin">{tr('Co-Admin (Full Control)', 'شریک ایڈمن (مکمل اختیار)')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#800F2F] mb-1">
                    {tr('Approval Status', 'منظوری کی حیثیت')}
                  </label>
                  <select
                    value={newApprovalStatus}
                    onChange={(e) => setNewApprovalStatus(e.target.value as ApprovalStatus)}
                    className="w-full p-2.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
                  >
                    <option value="approved">{tr('Approve Immediately', 'فوری منظور کریں')}</option>
                    <option value="pending">{tr('Pending Admin Approval', 'منظوری کے لیے زیر التواء رکھیں')}</option>
                  </select>
                </div>
              </div>

              {newRole === 'staff' && (
                <div className="p-3 bg-[#F8F5F0] rounded-xl border border-[#E5DFD5] space-y-2">
                  <span className="font-bold text-[#800F2F] block">
                    {tr('Team Member Permissions', 'ٹیم ممبر کے اختیارات')}
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPerms.canAddEditData}
                      onChange={(e) => setNewPerms(p => ({ ...p, canAddEditData: e.target.checked }))}
                      className="accent-[#800F2F]"
                    />
                    <span>{tr('Data Entry (Add & Edit Rishtas, Requests, Proposals)', 'ڈیٹا انٹری (رشتے شامل اور ایڈٹ کرنا)')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPerms.canPrintExport}
                      onChange={(e) => setNewPerms(p => ({ ...p, canPrintExport: e.target.checked }))}
                      className="accent-[#800F2F]"
                    />
                    <span>{tr('Data Print & PDF / CSV Export', 'ڈیٹا پرنٹ اور پی ڈی ایف / ایکسپورٹ')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPerms.canManageInvoices}
                      onChange={(e) => setNewPerms(p => ({ ...p, canManageInvoices: e.target.checked }))}
                      className="accent-[#800F2F]"
                    />
                    <span>{tr('Invoices & Fee Payments', 'رسیدیں اور فیس ادائیگیاں')}</span>
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5DFD5]">
                <Button type="button" size="sm" variant="secondary" onClick={() => setAddModalOpen(false)}>
                  {tr('Cancel', 'منسوخ')}
                </Button>
                <Button type="submit" size="sm" variant="primary" disabled={submittingAdd}>
                  {submittingAdd ? tr('Creating...', 'بن رہا ہے...') : tr('Create User', 'یوزر بنائیں')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Permissions / Reset Password Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-[#2C2526]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border-2 border-[#D4AF37] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="font-serif text-base font-bold text-[#800F2F]">
              {tr('Manage User Access', 'یوزر کے اختیارات تبدیل کریں')}: {editingUser.name}
            </h3>
            <p className="text-[11px] text-[#6E6466]" dir="ltr">{editingUser.email}</p>

            <form onSubmit={handleSaveEditUser} className="space-y-3">
              <div>
                <label className="block font-semibold text-[#800F2F] mb-1">{tr('Role', 'عہدہ')}</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full p-2 rounded border border-[#E5DFD5] bg-[#F8F5F0]"
                >
                  <option value="staff">{tr('Team Member', 'ٹیم ممبر')}</option>
                  <option value="admin">{tr('Administrator', 'ایڈمنسٹریٹر')}</option>
                </select>
              </div>

              {editRole === 'staff' && (
                <div className="p-3 bg-[#F8F5F0] rounded-xl border border-[#E5DFD5] space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPerms.canAddEditData}
                      onChange={(e) => setEditPerms(p => ({ ...p, canAddEditData: e.target.checked }))}
                      className="accent-[#800F2F]"
                    />
                    <span>{tr('Data Entry (Add/Edit Rishtas)', 'ڈیٹا انٹری (رشتے شامل/ایڈٹ)')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPerms.canPrintExport}
                      onChange={(e) => setEditPerms(p => ({ ...p, canPrintExport: e.target.checked }))}
                      className="accent-[#800F2F]"
                    />
                    <span>{tr('Data Print & PDF Export', 'ڈیٹا پرنٹ اور پی ڈی ایف')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPerms.canManageInvoices}
                      onChange={(e) => setEditPerms(p => ({ ...p, canManageInvoices: e.target.checked }))}
                      className="accent-[#800F2F]"
                    />
                    <span>{tr('Manage Invoices & Payments', 'رسیدیں اور ادائیگیاں')}</span>
                  </label>
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#800F2F] mb-1">
                  {tr('Reset Password (leave blank to keep current)', 'نیا پاس ورڈ (تبدیل نہ کرنا ہو تو خالی چھوڑیں)')}
                </label>
                <input
                  type="password"
                  minLength={6}
                  dir="ltr"
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2 rounded border border-[#E5DFD5] bg-[#F8F5F0]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5DFD5]">
                <Button type="button" size="sm" variant="secondary" onClick={() => setEditingUser(null)}>
                  {tr('Cancel', 'منسوخ')}
                </Button>
                <Button type="submit" size="sm" variant="primary" disabled={submittingEdit}>
                  {submittingEdit ? tr('Saving...', 'محفوظ ہو رہا ہے...') : tr('Save Access', 'اختیارات محفوظ کریں')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Own Admin Credentials Modal */}
      {credModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2C2526]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border-2 border-[#D4AF37] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="font-serif text-base font-bold text-[#800F2F]">
              {tr('Update Your Admin Login ID & Password', 'ایڈمن لاگ ان آئی ڈی اور پاس ورڈ تبدیل کریں')}
            </h3>
            <form onSubmit={handleUpdateOwnCreds} className="space-y-3">
              <div>
                <label className="block font-semibold text-[#800F2F] mb-1">{tr('Admin Name', 'ایڈمن نام')}</label>
                <input
                  type="text"
                  required
                  value={credName}
                  onChange={(e) => setCredName(e.target.value)}
                  className="w-full p-2 rounded border border-[#E5DFD5] bg-[#F8F5F0]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#800F2F] mb-1">{tr('Admin Email Login ID', 'ایڈمن ای میل آئی ڈی')}</label>
                <input
                  type="email"
                  required
                  dir="ltr"
                  value={credEmail}
                  onChange={(e) => setCredEmail(e.target.value)}
                  className="w-full p-2 rounded border border-[#E5DFD5] bg-[#F8F5F0]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#800F2F] mb-1">
                  {tr('Current Password (Required)', 'موجودہ پاس ورڈ (لازمی)')} *
                </label>
                <input
                  type="password"
                  required
                  dir="ltr"
                  value={credCurrentPassword}
                  onChange={(e) => setCredCurrentPassword(e.target.value)}
                  className="w-full p-2 rounded border border-[#E5DFD5] bg-[#F8F5F0]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#800F2F] mb-1">
                  {tr('New Password (optional, min 6 chars)', 'نیا پاس ورڈ (اختیاری، کم از کم 6 حروف)')}
                </label>
                <input
                  type="password"
                  minLength={6}
                  dir="ltr"
                  value={credNewPassword}
                  onChange={(e) => setCredNewPassword(e.target.value)}
                  className="w-full p-2 rounded border border-[#E5DFD5] bg-[#F8F5F0]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5DFD5]">
                <Button type="button" size="sm" variant="secondary" onClick={() => setCredModalOpen(false)}>
                  {tr('Cancel', 'منسوخ')}
                </Button>
                <Button type="submit" size="sm" variant="primary" disabled={credSubmitting}>
                  {credSubmitting ? tr('Updating...', 'اپ ڈیٹ ہو رہا ہے...') : tr('Update Credentials', 'تفصیلات محفوظ کریں')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

