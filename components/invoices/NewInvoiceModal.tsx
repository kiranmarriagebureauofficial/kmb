'use client';

import React, { useState } from 'react';
import { InvoiceType, PaymentMethod } from '@/lib/types';
import { store } from '@/lib/db/store';
import { Button } from '../ui/Button';
import { formatPKR } from '@/lib/utils';
import { Receipt, X, Plus, Trash2 } from 'lucide-react';

interface NewInvoiceModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  defaultProfileId?: string;
}

export function NewInvoiceModal({
  onClose,
  onSuccess,
  defaultProfileId,
}: NewInvoiceModalProps) {
  const profiles = store.getProfiles();
  const settings = store.getSettings();

  const [selectedProfileId, setSelectedProfileId] = useState(
    defaultProfileId || (profiles[0]?.id || '')
  );
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('registration');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<{ id: string; description: string; amount: number }[]>([
    {
      id: '1',
      description: 'Registration Fee & Proposal Intake',
      amount: settings.feeDefaults.registrationFee,
    },
  ]);
  const [discount, setDiscount] = useState(0);
  const [initialPayment, setInitialPayment] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  const handleTypeChange = (type: InvoiceType) => {
    setInvoiceType(type);
    let amount = settings.feeDefaults.registrationFee;
    let desc = 'Registration Fee & Proposal Intake';

    if (type === 'premium') {
      amount = settings.feeDefaults.premiumMembershipFee;
      desc = '6-Month Premium Rishtay Membership';
    } else if (type === 'success') {
      amount = settings.feeDefaults.successFee;
      desc = 'Success Fee (Rishta Done & Finalized)';
    } else {
      amount = 5000;
      desc = 'Consultation / Verification Service';
    }

    setItems([{ id: '1', description: desc, amount }]);
  };

  const addItem = () => {
    setItems([
      ...items,
      { id: String(Date.now()), description: 'Additional Matrimonial Service', amount: 5000 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: 'description' | 'amount', value: any) => {
    setItems(
      items.map(it => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  const subtotal = items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
  const total = Math.max(0, subtotal - (Number(discount) || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;

    setSaving(true);
    try {
      store.createInvoice({
        profileId: selectedProfile.id,
        clientName: `${selectedProfile.name} (${selectedProfile.formNo})`,
        clientPhone: selectedProfile.phone,
        invoiceType,
        items,
        subtotal,
        discount,
        total,
        date,
        dueDate: dueDate || undefined,
        notes: notes || undefined,
        initialPayment: Number(initialPayment) || 0,
        paymentMethod,
      });

      // If premium membership invoice is paid, update profile premium status!
      if (invoiceType === 'premium' && initialPayment >= total) {
        store.updateProfile(selectedProfile.id, {
          premiumMember: true,
          premiumStartDate: date,
          premiumEndDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
        });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Invoice creation failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2C2526]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="bg-[#800F2F] text-[#F8F5F0] p-4 flex items-center justify-between border-b border-[#D4AF37]">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-serif text-base font-bold tracking-wide">
              Generate New Client Fee Invoice
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#660A22] text-[#E5DFD5]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#800F2F] mb-1">
              Select Client / Profile *
            </label>
            <select
              required
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] font-medium"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.formNo} - {p.name} ({p.gender}, {p.caste}, {p.city})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">
                Fee Category *
              </label>
              <select
                value={invoiceType}
                onChange={(e) => handleTypeChange(e.target.value as InvoiceType)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] font-medium"
              >
                <option value="registration">Registration Fee</option>
                <option value="premium">Premium Membership Fee</option>
                <option value="success">Success Fee</option>
                <option value="other">Other Service</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">
                Invoice Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-[#800F2F]">
                Invoice Line Items
              </label>
              <button
                type="button"
                onClick={addItem}
                className="text-[11px] text-[#800F2F] hover:text-[#D4AF37] font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>+ Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map(it => (
                <div key={it.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={it.description}
                    onChange={(e) => updateItem(it.id, 'description', e.target.value)}
                    placeholder="Description"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
                  />
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={it.amount}
                    onChange={(e) => updateItem(it.id, 'amount', parseInt(e.target.value, 10))}
                    className="w-28 px-3 py-1.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] font-mono text-right"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(it.id)}
                      className="p-1.5 text-[#A3182E] hover:bg-[#F8F5F0] rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">
                Discount (PKR)
              </label>
              <input
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] font-mono text-right"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-[#F8F5F0] border border-[#E5DFD5] text-right">
              <span className="text-[10px] uppercase font-bold text-[#6E6466] block">Net Payable</span>
              <span className="font-serif font-bold text-base text-[#800F2F]">{formatPKR(total)}</span>
            </div>
          </div>

          {/* Initial Payment Section */}
          <div className="p-3 bg-[#F8F5F0] rounded-xl border border-[#D4AF37]/40 space-y-3">
            <span className="font-bold text-[#800F2F] block">
              Record Initial Payment (Optional)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#6E6466] mb-1">
                  Amount Received Now:
                </label>
                <input
                  type="number"
                  min={0}
                  max={total}
                  value={initialPayment}
                  onChange={(e) => setInitialPayment(parseInt(e.target.value, 10) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-white font-mono text-right font-bold text-[#800F2F]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#6E6466] mb-1">
                  Payment Method:
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-white font-medium"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Easypaisa">Easypaisa</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5DFD5] flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              icon={<Receipt className="w-4 h-4 text-[#D4AF37]" />}
            >
              {saving ? 'Creating...' : 'Create & Issue Invoice'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

