'use client';

import React, { useState } from 'react';
import { Invoice, PaymentMethod } from '@/lib/types';
import { store } from '@/lib/db/store';
import { Button } from '../ui/Button';
import { formatPKR } from '@/lib/utils';
import { CreditCard, X, Check } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

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
  const { tr } = useLanguage();
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
    <div className="fixed inset-0 z-50 bg-[#2C2526]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#800F2F] text-[#F8F5F0] p-4 flex items-center justify-between border-b border-[#D4AF37]">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-serif text-base font-bold tracking-wide">
              {tr('Record Client Fee Payment', 'کلائنٹ فیس کی ادائیگی درج کریں')}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#660A22] text-[#E5DFD5]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-[#F8F5F0] rounded-xl border border-[#E5DFD5] space-y-1">
            <div className="flex justify-between">
              <span className="text-[#6E6466]">{tr('Invoice Number:', 'انوائس نمبر:')}</span>
              <span className="font-mono font-bold text-[#800F2F]">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6E6466]">{tr('Client Name:', 'کلائنٹ کا نام:')}</span>
              <span className="font-semibold">{invoice.clientName}</span>
            </div>
            <div className="flex justify-between border-t border-[#E5DFD5] pt-1">
              <span className="text-[#6E6466]">{tr('Outstanding Balance:', 'واجب الادا بقیہ رقم:')}</span>
              <span className="font-bold text-[#A3182E]">{formatPKR(invoice.balance)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">
                {tr('Payment Amount (PKR) *', 'ادائیگی کی رقم (روپے) *')}
              </label>
              <input
                type="number"
                required
                min={1}
                max={invoice.balance}
                step={500}
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] font-mono text-end font-bold text-[#800F2F]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">
                {tr('Payment Date *', 'ادائیگی کی تاریخ *')}
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">
                {tr('Payment Method *', 'ادائیگی کا طریقہ *')}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] font-medium"
              >
                <option value="Cash">{tr('Cash', 'نقد')}</option>
                <option value="Bank Transfer">{tr('Bank Transfer', 'بینک ٹرانسفر')}</option>
                <option value="JazzCash">{tr('JazzCash', 'جاز کیش')}</option>
                <option value="Easypaisa">{tr('Easypaisa', 'ایزی پیسہ')}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">
                {tr('Receipt Number *', 'رسید نمبر *')}
              </label>
              <input
                type="text"
                required
                dir="ltr"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[#800F2F] mb-1">
              {tr('Received By (Staff Member) *', 'وصول کنندہ (عملے کا رکن) *')}
            </label>
            <input
              type="text"
              required
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#800F2F] mb-1">
              {tr('Payment Remarks / Reference Note', 'ادائیگی کی تفصیل / حوالہ')}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={tr('e.g. Bank online transaction ID or cash desk slip', 'مثال: بینک ٹرانزیکشن نمبر یا نقد کیش پرچی')}
              className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
            />
          </div>

          <div className="pt-3 border-t border-[#E5DFD5] flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              {tr('Cancel', 'منسوخ')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              icon={<Check className="w-4 h-4 text-[#D4AF37]" />}
            >
              {saving
                ? tr('Recording...', 'محفوظ ہو رہا ہے...')
                : tr('Record Payment & Issue Receipt', 'ادائیگی درج کریں اور رسید بنائیں')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

