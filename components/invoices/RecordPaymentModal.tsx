'use client';

import React, { useState } from 'react';
import { Invoice, PaymentMethod } from '@/lib/types';
import { store } from '@/lib/db/store';
import { Button } from '../ui/Button';
import { formatPKR } from '@/lib/utils';
import { CreditCard, X, Check } from 'lucide-react';

interface RecordPaymentModalProps {
  invoice: Invoice;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RecordPaymentModal({
  invoice,
  onClose,
  onSuccess,
}: RecordPaymentModalProps) {
  const currentUser = store.getCurrentUser();
  const [amount, setAmount] = useState(invoice.balance || 0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [receivedBy, setReceivedBy] = useState(currentUser?.name || 'Begum Kiran Shah');
  const [receiptNumber, setReceiptNumber] = useState(
    `REC-${invoice.invoiceNumber.replace('INV-', '')}-${invoice.payments.length + 1}`
  );
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    setSaving(true);
    try {
      store.recordPayment(invoice.id, {
        amount: Number(amount),
        paymentDate,
        paymentMethod,
        receivedBy,
        receiptNumber,
        notes: notes || undefined,
      });

      // If premium membership balance reached 0, activate premium status
      if (invoice.invoiceType === 'premium' && invoice.balance - amount <= 0) {
        store.updateProfile(invoice.profileId, {
          premiumMember: true,
          premiumStartDate: paymentDate,
          premiumEndDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
        });
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to record payment:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2A0A0F]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFFDF8] border border-[#E9DDC3] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#5A0A14] text-[#FBF4E6] p-4 flex items-center justify-between border-b border-[#D9A93F]">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#D9A93F]" />
            <h2 className="font-serif text-base font-bold tracking-wide">
              Record Client Fee Payment
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#420610] text-[#E9DDC3]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-[#FBF4E6] rounded-xl border border-[#E9DDC3] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#7B5E5E]">Invoice Number:</span>
              <span className="font-mono font-bold text-[#5A0A14]">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7B5E5E]">Client Name:</span>
              <span className="font-semibold">{invoice.clientName}</span>
            </div>
            <div className="flex justify-between border-t border-[#E9DDC3] pt-1">
              <span className="text-[#7B5E5E]">Outstanding Balance:</span>
              <span className="font-bold text-[#8E1B2B]">{formatPKR(invoice.balance)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#5A0A14] mb-1">
                Payment Amount (PKR) *
              </label>
              <input
                type="number"
                required
                min={1}
                max={invoice.balance}
                step={500}
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] font-mono text-right font-bold text-[#5A0A14]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5A0A14] mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#5A0A14] mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] font-medium"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Easypaisa">Easypaisa</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#5A0A14] mb-1">
                Receipt Number *
              </label>
              <input
                type="text"
                required
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#5A0A14] mb-1">
              Received By (Staff Member) *
            </label>
            <input
              type="text"
              required
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#5A0A14] mb-1">
              Payment Remarks / Reference Note
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Bank online transaction ID or cash desk slip"
              className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6]"
            />
          </div>

          <div className="pt-3 border-t border-[#E9DDC3] flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              icon={<Check className="w-4 h-4 text-[#D9A93F]" />}
            >
              {saving ? 'Recording...' : 'Record Payment & Issue Receipt'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

