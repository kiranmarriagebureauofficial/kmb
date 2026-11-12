'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { store } from '@/lib/db/store';
import { useLanguage } from '@/lib/useLanguage';
import { Invoice, InvoiceStatus, InvoiceType } from '@/lib/types';
import { formatPKR, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { InvoiceReceipt } from '@/components/invoices/InvoiceReceipt';
import { NewInvoiceModal } from '@/components/invoices/NewInvoiceModal';
import { RecordPaymentModal } from '@/components/invoices/RecordPaymentModal';
import { 
  Receipt, 
  Plus, 
  Printer, 
  CreditCard, 
  Filter, 
  TrendingUp, 
  Check, 
  X, 
  AlertCircle,
  Eye
} from 'lucide-react';

function InvoicesManagementContent() {
  const { tr } = useLanguage();
  const searchParams = useSearchParams();
  const shouldOpenNew = searchParams.get('new') === '1';

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentUser, setCurrentUser] = useState(store.getCurrentUser());
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showNewModal, setShowNewModal] = useState(shouldOpenNew);
  const [selectedReceipt, setSelectedReceipt] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);

  const update = () => {
    setInvoices(store.getInvoices());
    setCurrentUser(store.getCurrentUser());
  };

  useEffect(() => {
    update();
    const unsub = store.subscribe(update);
    return unsub;
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchesQ =
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.clientName.toLowerCase().includes(q) ||
          inv.clientPhone.includes(q);
        if (!matchesQ) return false;
      }
      if (filterType !== 'All' && inv.invoiceType !== filterType) return false;
      if (filterStatus !== 'All' && inv.status !== filterStatus) return false;
      return true;
    });
  }, [invoices, searchTerm, filterType, filterStatus]);

  // Aggregate stats
  const totalBilled = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalCollected = filteredInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalOutstanding = filteredInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  const handleCancelInvoice = (id: string, num: string) => {
    if (!isAdmin) {
      alert(tr('Only administrators are authorized to cancel official invoices.', 'صرف منتظم (ایڈمن) سرکاری انوائس منسوخ کرنے کے مجاز ہیں۔'));
      return;
    }
    if (confirm(tr(`Are you sure you want to cancel invoice ${num}?`, `کیا آپ واقعی انوائس ${num} منسوخ کرنا چاہتے ہیں؟`))) {
      store.cancelInvoice(id);
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFFFF] text-[#800F2F] border border-[#D4AF37]">
            <Check className="w-3 h-3 text-[#D4AF37] stroke-[3]" />
            <span>{tr('Fully Settled', 'مکمل ادا شدہ')}</span>
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F8F5F0] text-[#B88B22] border border-[#D4AF37]">
            <span>{tr('Partially Paid', 'جزوی ادا شدہ')}</span>
          </span>
        );
      case 'unpaid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFFFFF] text-[#A3182E] border border-[#A3182E]/40">
            <AlertCircle className="w-3 h-3 text-[#A3182E]" />
            <span>{tr('Unpaid', 'غیر ادا شدہ')}</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F8F5F0] text-[#6E6466] line-through border border-[#E5DFD5]">
            <span>{tr('Cancelled', 'منسوخ')}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5DFD5] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-serif font-bold tracking-widest text-[#B88B22]">
            {tr('Fee Accounting & Cash Desk', 'فیس اکاؤنٹنگ اور کیش ڈیسک')}
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#800F2F] mt-0.5">
            {tr('Client Invoices & Fee Ledger', 'کلائنٹ انوائسز اور فیس لیجر')} ({filteredInvoices.length})
          </h1>
          <p className="text-xs text-[#6E6466]">
            {tr('Automated sequential numbering (INV-2026-XXXX). Generates A4, A5, and 80mm POS thermal receipts.', 'خودکار ترتیب وار نمبرنگ۔ A4، A5 اور 80mm تھرمل رسیدیں تیار کریں۔')}
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setShowNewModal(true)}
          icon={<Plus className="w-3.5 h-3.5 text-[#D4AF37]" />}
        >
          {tr('Create New Invoice', 'نئی انوائس بنائیں')}
        </Button>
      </div>

      {/* Aggregate Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#E5DFD5] shadow-sm text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#6E6466]">{tr('Total Billed (Net)', 'کل بل رقم')}</span>
          <p className="font-serif text-2xl font-bold text-[#800F2F]">{formatPKR(totalBilled)}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D4AF37] shadow-sm text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#B88B22]">{tr('Collected Revenue', 'وصول شدہ رقم')}</span>
          <p className="font-serif text-2xl font-bold text-[#B88B22]">{formatPKR(totalCollected)}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#A3182E]/40 shadow-sm text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#A3182E]">{tr('Outstanding Balance Due', 'واجب الادا بقایا')}</span>
          <p className="font-serif text-2xl font-bold text-[#A3182E]">{formatPKR(totalOutstanding)}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={tr('Search by invoice number or client name...', 'انوائس نمبر یا کلائنٹ کے نام سے تلاش کریں...')}
            className="w-full px-3 py-1.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
            >
              <option value="All">{tr('All Fee Types', 'تمام اقسام کی فیس')}</option>
              <option value="registration">{tr('Registration Fee', 'رجسٹریشن فیس')}</option>
              <option value="premium">{tr('Premium Membership', 'پریمیم ممبرشپ')}</option>
              <option value="success">{tr('Success Fee', 'کامیابی فیس')}</option>
              <option value="other">{tr('Other', 'دیگر')}</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0]"
            >
              <option value="All">{tr('All Payment Statuses', 'ادائیگی کی تمام حیثیتیں')}</option>
              <option value="paid">{tr('Fully Settled', 'مکمل ادا شدہ')}</option>
              <option value="partial">{tr('Partially Paid', 'جزوی ادا شدہ')}</option>
              <option value="unpaid">{tr('Unpaid', 'غیر ادا شدہ')}</option>
              <option value="cancelled">{tr('Cancelled', 'منسوخ')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start">
            <thead className="bg-[#800F2F] text-[#F8F5F0] uppercase font-serif tracking-wider">
              <tr>
                <th className="p-3.5">{tr('Invoice #', 'انوائس نمبر')}</th>
                <th className="p-3.5">{tr('Client & Phone', 'کلائنٹ اور فون')}</th>
                <th className="p-3.5">{tr('Category', 'فیس کی قسم')}</th>
                <th className="p-3.5 text-end">{tr('Total Net', 'کل رقم')}</th>
                <th className="p-3.5 text-end">{tr('Paid', 'ادائیگی')}</th>
                <th className="p-3.5 text-end">{tr('Balance', 'بقایا')}</th>
                <th className="p-3.5">{tr('Status', 'حیثیت')}</th>
                <th className="p-3.5 text-end">{tr('Actions', 'اعمال')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD5]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#6E6466]">
                    {tr('No invoices match your filter criteria.', 'موجودہ فلٹر کے مطابق کوئی انوائس موجود نہیں۔')}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-[#F8F5F0]/60 transition-colors">
                    {/* Invoice # */}
                    <td className="p-3.5 font-mono font-bold text-[#800F2F] whitespace-nowrap">
                      {inv.invoiceNumber}
                      <span className="text-[10px] text-[#6E6466] block font-sans font-normal">
                        {formatDate(inv.date)}
                      </span>
                    </td>

                    {/* Client */}
                    <td className="p-3.5">
                      <div className="font-bold text-[#2C2526] text-sm">{inv.clientName}</div>
                      <div className="text-[11px] text-[#6E6466]">{inv.clientPhone}</div>
                    </td>

                    {/* Category */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="capitalize font-semibold text-[#800F2F]">
                        {inv.invoiceType} Fee
                      </span>
                    </td>

                    {/* Total */}
                    <td className="p-3.5 text-right font-mono font-bold text-[#2C2526] whitespace-nowrap">
                      {formatPKR(inv.total)}
                    </td>

                    {/* Paid */}
                    <td className="p-3.5 text-right font-mono font-semibold text-[#B88B22] whitespace-nowrap">
                      {formatPKR(inv.amountPaid)}
                    </td>

                    {/* Balance */}
                    <td className="p-3.5 text-right font-mono font-bold text-[#A3182E] whitespace-nowrap">
                      {formatPKR(inv.balance)}
                    </td>

                    {/* Status */}
                    <td className="p-3.5 whitespace-nowrap">
                      {getStatusBadge(inv.status)}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedReceipt(inv)}
                          className="p-1.5 rounded-lg bg-[#800F2F] hover:bg-[#660A22] text-[#D4AF37] text-[11px] font-semibold flex items-center gap-1 px-2.5 shadow-sm"
                          title={tr('Print Receipt (A4, A5, Thermal 80mm)', 'رسید پرنٹ کریں')}
                        >
                          <Printer className="w-3 h-3" />
                          <span>{tr('Receipt', 'رسید')}</span>
                        </button>

                        {inv.balance > 0 && inv.status !== 'cancelled' && (
                          <button
                            onClick={() => setPaymentInvoice(inv)}
                            className="p-1.5 rounded-lg bg-[#FFFFFF] border border-[#D4AF37] hover:bg-[#F8F5F0] text-[#800F2F] text-[11px] font-semibold flex items-center gap-1 px-2"
                            title={tr('Record partial or full payment', 'جزوی یا مکمل ادائیگی درج کریں')}
                          >
                            <CreditCard className="w-3 h-3 text-[#D4AF37]" />
                            <span>{tr('Pay', 'ادائیگی')}</span>
                          </button>
                        )}

                        {isAdmin && inv.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelInvoice(inv.id, inv.invoiceNumber)}
                            className="p-1.5 rounded-lg bg-[#FFFFFF] border border-[#A3182E]/30 hover:bg-[#A3182E] hover:text-white text-[#A3182E]"
                            title="Cancel Invoice (Admin Only)"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showNewModal && (
        <NewInvoiceModal
          onClose={() => setShowNewModal(false)}
          onSuccess={() => update()}
        />
      )}

      {selectedReceipt && (
        <InvoiceReceipt
          invoice={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {paymentInvoice && (
        <RecordPaymentModal
          invoice={paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
          onSuccess={() => update()}
        />
      )}
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#6E6466]">Loading invoices & fee manager...</div>}>
      <InvoicesManagementContent />
    </Suspense>
  );
}
