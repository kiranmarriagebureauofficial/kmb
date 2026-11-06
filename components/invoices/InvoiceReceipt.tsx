'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Invoice } from '@/lib/types';
import { store } from '@/lib/db/store';
import { formatPKR, formatDate } from '@/lib/utils';
import { Button } from '../ui/Button';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';

interface InvoiceReceiptProps {
  invoice: Invoice;
  onClose?: () => void;
}

export function InvoiceReceipt({ invoice, onClose }: InvoiceReceiptProps) {
  const [layoutMode, setLayoutMode] = useState<'a4' | 'a5' | 'thermal'>('a4');
  const settings = store.getSettings();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2C2526]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Controls bar (No print) */}
        <div className="no-print p-4 bg-[#800F2F] text-[#F8F5F0] flex items-center justify-between border-b border-[#D4AF37] shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-sm tracking-wide">
              Official Receipt & Invoice
            </span>
            <div className="flex items-center bg-[#660A22] rounded-lg p-0.5 border border-[#D4AF37]/40 text-xs">
              <button
                onClick={() => setLayoutMode('a4')}
                className={`px-2.5 py-1 rounded ${layoutMode === 'a4' ? 'bg-[#D4AF37] text-[#660A22] font-bold' : 'text-[#E5DFD5]'}`}
              >
                A4 Standard
              </button>
              <button
                onClick={() => setLayoutMode('a5')}
                className={`px-2.5 py-1 rounded ${layoutMode === 'a5' ? 'bg-[#D4AF37] text-[#660A22] font-bold' : 'text-[#E5DFD5]'}`}
              >
                A5 Slip
              </button>
              <button
                onClick={() => setLayoutMode('thermal')}
                className={`px-2.5 py-1 rounded ${layoutMode === 'thermal' ? 'bg-[#D4AF37] text-[#660A22] font-bold' : 'text-[#E5DFD5]'}`}
              >
                80mm Thermal
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="accent"
              onClick={handlePrint}
              icon={<Printer className="w-4 h-4 text-[#660A22]" />}
            >
              Print Receipt
            </Button>
            {onClose && (
              <button onClick={onClose} className="p-1 rounded hover:bg-[#660A22] text-[#E5DFD5]">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 overflow-y-auto">
          {layoutMode === 'thermal' ? (
            /* 80mm POS Thermal Receipt Layout */
            <div className="w-[300px] mx-auto p-4 bg-white border border-gray-300 rounded font-mono text-[11px] text-black space-y-3 print:w-full print:border-none">
              <div className="text-center space-y-1 border-b border-black pb-2">
                <div className="w-16 h-16 relative mx-auto">
                  <Image src="/brand/logo-print.png" alt="Logo" fill className="object-contain" />
                </div>
                <h2 className="font-bold text-sm tracking-wider">KIRAN MARRIAGE BUREAU</h2>
                <p className="text-[10px]">Jail Road, Gulberg V, Lahore</p>
                <p className="text-[10px]">Ph: {settings.phone1}</p>
                <p className="text-[10px]">WhatsApp: {settings.whatsapp}</p>
              </div>

              <div className="border-b border-black pb-2 space-y-0.5">
                <div className="flex justify-between">
                  <span>RECEIPT NO:</span>
                  <span className="font-bold">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE:</span>
                  <span>{formatDate(invoice.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CLIENT:</span>
                  <span className="font-bold truncate max-w-[150px]">{invoice.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span>PHONE:</span>
                  <span>{invoice.clientPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span>CATEGORY:</span>
                  <span className="uppercase">{invoice.invoiceType} Fee</span>
                </div>
              </div>

              <div className="border-b border-black pb-2">
                <div className="font-bold mb-1">ITEMS / PARTICULARS:</div>
                {invoice.items.map((it, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="truncate max-w-[180px]">{it.description}</span>
                    <span>{formatPKR(it.amount)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 border-b border-black pb-2 font-bold">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>{formatPKR(invoice.subtotal)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex justify-between">
                    <span>DISCOUNT:</span>
                    <span>-{formatPKR(invoice.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span>TOTAL NET:</span>
                  <span>{formatPKR(invoice.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>AMOUNT PAID:</span>
                  <span>{formatPKR(invoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span>BALANCE DUE:</span>
                  <span>{formatPKR(invoice.balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>STATUS:</span>
                  <span className="uppercase">{invoice.status}</span>
                </div>
              </div>

              {invoice.payments.length > 0 && (
                <div className="border-b border-black pb-2 space-y-1 text-[10px]">
                  <div className="font-bold">PAYMENT LOG:</div>
                  {invoice.payments.map(p => (
                    <div key={p.id} className="flex justify-between">
                      <span>{formatDate(p.paymentDate)} ({p.paymentMethod})</span>
                      <span>{formatPKR(p.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-center pt-2 text-[10px] space-y-1">
                <p>Thank you for placing trust in Kiran Marriage Bureau.</p>
                <p>Fees are non-refundable & non-transferable.</p>
                <p>*** DIGNITY & HONOR IN MATRIMONY ***</p>
              </div>
            </div>
          ) : (
            /* Standard A4 / A5 Layout */
            <div className={`mx-auto bg-white border-2 border-[#800F2F] p-8 rounded-lg ${layoutMode === 'a5' ? 'max-w-xl text-xs' : 'max-w-2xl text-sm'}`}>
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-[#800F2F] pb-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 relative shrink-0">
                    <Image src="/brand/logo-print.png" alt="Logo" fill className="object-contain" />
                  </div>
                  <div>
                    <h1 className="font-serif text-xl font-bold text-[#800F2F] tracking-wider leading-none">
                      KIRAN MARRIAGE BUREAU
                    </h1>
                    <h2 className="font-urdu text-base font-bold text-[#800F2F] mt-0.5">
                      کرن میرج بیورو لاہور
                    </h2>
                    <p className="text-[11px] text-[#6E6466]">
                      {settings.address}
                    </p>
                    <p className="text-[11px] text-[#800F2F] font-medium">
                      Ph: {settings.phone1} • WhatsApp: {settings.whatsapp}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-[#800F2F] text-[#F8F5F0] font-bold text-xs rounded uppercase tracking-wider">
                    Official Fee Invoice
                  </span>
                  <p className="font-serif text-base font-bold text-[#800F2F] mt-1">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-xs text-[#6E6466]">Date: {formatDate(invoice.date)}</p>
                </div>
              </div>

              {/* Billed To Details */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-[#F8F5F0] rounded-lg border border-[#E5DFD5] mb-6 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6E6466] block">Billed To / Client:</span>
                  <p className="font-bold text-[#2C2526] text-sm">{invoice.clientName}</p>
                  <p className="text-[#6E6466]">Phone: {invoice.clientPhone}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#6E6466] block">Fee Category:</span>
                  <p className="font-bold text-[#800F2F] uppercase text-xs">{invoice.invoiceType} Fee</p>
                  <p className="text-[#6E6466]">
                    Payment Status: <strong className="uppercase text-[#800F2F]">{invoice.status}</strong>
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs border border-[#E5DFD5] border-collapse mb-6">
                <thead>
                  <tr className="bg-[#800F2F] text-[#F8F5F0]">
                    <th className="p-2.5 text-left">Description / Particulars</th>
                    <th className="p-2.5 text-right w-32">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD5]">
                  {invoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-3 text-[#2C2526] font-medium">{it.description}</td>
                      <td className="p-3 text-right font-mono font-bold text-[#2C2526]">
                        {formatPKR(it.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#E5DFD5]">
                    <td className="p-2 text-right font-semibold text-[#6E6466]">Subtotal:</td>
                    <td className="p-2 text-right font-mono font-semibold">{formatPKR(invoice.subtotal)}</td>
                  </tr>
                  {invoice.discount > 0 && (
                    <tr>
                      <td className="p-2 text-right font-semibold text-[#A3182E]">Discount:</td>
                      <td className="p-2 text-right font-mono font-semibold text-[#A3182E]">-{formatPKR(invoice.discount)}</td>
                    </tr>
                  )}
                  <tr className="bg-[#F8F5F0] border-t-2 border-[#800F2F]">
                    <td className="p-2.5 text-right font-bold text-[#800F2F] text-sm">Total Payable:</td>
                    <td className="p-2.5 text-right font-mono font-bold text-[#800F2F] text-sm">{formatPKR(invoice.total)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-right font-semibold text-[#2C2526]">Amount Received:</td>
                    <td className="p-2 text-right font-mono font-bold text-[#2C2526]">{formatPKR(invoice.amountPaid)}</td>
                  </tr>
                  <tr className="border-t border-[#E5DFD5]">
                    <td className="p-2 text-right font-bold text-[#A3182E]">Outstanding Balance:</td>
                    <td className="p-2 text-right font-mono font-bold text-[#A3182E]">{formatPKR(invoice.balance)}</td>
                  </tr>
                </tfoot>
              </table>

              {/* Payments Log */}
              {invoice.payments.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-xs font-serif font-bold uppercase text-[#800F2F] tracking-wider mb-2">
                    Payment Receipts Breakdown
                  </h4>
                  <table className="w-full text-xs border border-[#E5DFD5]">
                    <thead className="bg-[#F8F5F0] text-[#6E6466]">
                      <tr>
                        <th className="p-2 text-left">Receipt #</th>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Method</th>
                        <th className="p-2 text-left">Received By</th>
                        <th className="p-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5DFD5]">
                      {invoice.payments.map(p => (
                        <tr key={p.id}>
                          <td className="p-2 font-mono">{p.receiptNumber}</td>
                          <td className="p-2">{formatDate(p.paymentDate)}</td>
                          <td className="p-2 font-medium">{p.paymentMethod}</td>
                          <td className="p-2 text-[#6E6466]">{p.receivedBy}</td>
                          <td className="p-2 text-right font-mono font-bold">{formatPKR(p.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Signatures */}
              <div className="mt-8 pt-4 border-t border-[#D4AF37] flex items-center justify-between text-xs text-[#6E6466]">
                <div>
                  <p className="font-semibold text-[#800F2F]">Kiran Marriage Bureau</p>
                  <p className="text-[11px]">System-Generated Receipt</p>
                </div>
                <div className="text-right">
                  <p>Authorized Cashier / Stamp: ______________________</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

