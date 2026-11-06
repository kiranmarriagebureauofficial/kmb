'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { store } from '@/lib/db/store';
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

export default function InvoicesManagementPage() {
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
      alert('Only administrators are authorized to cancel official invoices.');
      return;
    }
    if (confirm(`Are you sure you want to cancel invoice ${num}?`)) {
      store.cancelInvoice(id);
    }
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFDF8] text-[#5A0A14] border border-[#D9A93F]">
            <Check className="w-3 h-3 text-[#D9A93F] stroke-[3]" />
            <span>Fully Settled</span>
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FBF4E6] text-[#B08626] border border-[#D9A93F]">
            <span>Partially Paid</span>
          </span>
        );
      case 'unpaid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFFDF8] text-[#8E1B2B] border border-[#8E1B2B]/40">
            <AlertCircle className="w-3 h-3 text-[#8E1B2B]" />
            <span>Unpaid</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FBF4E6] text-[#7B5E5E] line-through border border-[#E9DDC3]">
            <span>Cancelled</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#FFFDF8] p-5 rounded-2xl border border-[#E9DDC3] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase font-serif font-bold tracking-widest text-[#B08626]">
            Fee Accounting & Cash Desk
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#5A0A14] mt-0.5">
            Client Invoices & Fee Ledger ({filteredInvoices.length})
          </h1>
          <p className="text-xs text-[#7B5E5E]">
            Automated sequential numbering (INV-2026-XXXX). Generates A4, A5, and 80mm POS thermal receipts.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setShowNewModal(true)}
          icon={<Plus className="w-3.5 h-3.5 text-[#D9A93F]" />}
        >
          Create New Invoice
        </Button>
      </div>

      {/* Aggregate Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#FFFDF8] border border-[#E9DDC3] shadow-sm text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#7B5E5E]">Total Billed (Net)</span>
          <p className="font-serif text-2xl font-bold text-[#5A0A14]">{formatPKR(totalBilled)}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFDF8] border border-[#D9A93F] shadow-sm text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#B08626]">Collected Revenue</span>
          <p className="font-serif text-2xl font-bold text-[#B08626]">{formatPKR(totalCollected)}</p>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFDF8] border border-[#8E1B2B]/40 shadow-sm text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#8E1B2B]">Outstanding Balance Due</span>
          <p className="font-serif text-2xl font-bold text-[#8E1B2B]">{formatPKR(totalOutstanding)}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#FFFDF8] border border-[#E9DDC3] rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice number or client name..."
            className="w-full px-3 py-1.5 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6]"
            >
              <option value="All">All Fee Types</option>
              <option value="registration">Registration Fee</option>
              <option value="premium">Premium Membership</option>
              <option value="success">Success Fee</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6]"
            >
              <option value="All">All Payment Statuses</option>
              <option value="paid">Fully Settled</option>
              <option value="partial">Partially Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-[#FFFDF8] border border-[#E9DDC3] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#5A0A14] text-[#FBF4E6] uppercase font-serif tracking-wider">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Client & Phone</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-right">Total Net</th>
                <th className="p-3.5 text-right">Paid</th>
                <th className="p-3.5 text-right">Balance</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DDC3]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#7B5E5E]">
                    No invoices match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-[#FBF4E6]/60 transition-colors">
                    {/* Invoice # */}
                    <td className="p-3.5 font-mono font-bold text-[#5A0A14] whitespace-nowrap">
                      {inv.invoiceNumber}
                      <span className="text-[10px] text-[#7B5E5E] block font-sans font-normal">
                        {formatDate(inv.date)}
                      </span>
                    </td>

                    {/* Client */}
                    <td className="p-3.5">
                      <div className="font-bold text-[#2A0A0F] text-sm">{inv.clientName}</div>
                      <div className="text-[11px] text-[#7B5E5E]">{inv.clientPhone}</div>
                    </td>

                    {/* Category */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="capitalize font-semibold text-[#5A0A14]">
                        {inv.invoiceType} Fee
                      </span>
                    </td>

                    {/* Total */}
                    <td className="p-3.5 text-right font-mono font-bold text-[#2A0A0F] whitespace-nowrap">
                      {formatPKR(inv.total)}
                    </td>

                    {/* Paid */}
                    <td className="p-3.5 text-right font-mono font-semibold text-[#B08626] whitespace-nowrap">
                      {formatPKR(inv.amountPaid)}
                    </td>

                    {/* Balance */}
                    <td className="p-3.5 text-right font-mono font-bold text-[#8E1B2B] whitespace-nowrap">
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
                          className="p-1.5 rounded-lg bg-[#5A0A14] hover:bg-[#420610] text-[#D9A93F] text-[11px] font-semibold flex items-center gap-1 px-2.5 shadow-sm"
                          title="Print Receipt (A4, A5, Thermal 80mm)"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>

                        {inv.balance > 0 && inv.status !== 'cancelled' && (
                          <button
                            onClick={() => setPaymentInvoice(inv)}
                            className="p-1.5 rounded-lg bg-[#FFFDF8] border border-[#D9A93F] hover:bg-[#FBF4E6] text-[#5A0A14] text-[11px] font-semibold flex items-center gap-1 px-2"
                            title="Record partial or full payment"
                          >
                            <CreditCard className="w-3 h-3 text-[#D9A93F]" />
                            <span>Pay</span>
                          </button>
                        )}

                        {isAdmin && inv.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelInvoice(inv.id, inv.invoiceNumber)}
                            className="p-1.5 rounded-lg bg-[#FFFDF8] border border-[#8E1B2B]/30 hover:bg-[#8E1B2B] hover:text-white text-[#8E1B2B]"
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
