'use client';

import React, { useState } from 'react';
import { Proposal, Profile, Invoice } from '@/lib/types';
import { store } from '@/lib/db/store';
import { Button } from '../ui/Button';
import { formatPKR } from '@/lib/utils';
import { Star, CheckCircle, Receipt, X, Heart } from 'lucide-react';

interface MarkRishtaDoneModalProps {
  proposal: Proposal;
  onClose: () => void;
  onSuccess: (result: { invoice: Invoice }) => void;
}

export function MarkRishtaDoneModal({
  proposal,
  onClose,
  onSuccess,
}: MarkRishtaDoneModalProps) {
  const settings = store.getSettings();
  const profileA = store.getProfileById(proposal.profileAId);
  const profileB = store.getProfileById(proposal.profileBId);

  const [billedPartyId, setBilledPartyId] = useState(proposal.profileAId);
  const [feeAmount, setFeeAmount] = useState(settings.feeDefaults.successFee);
  const [isDone, setIsDone] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);

  const handleConfirm = () => {
    const res = store.markRishtaDone(proposal.id, billedPartyId, feeAmount);
    if (res) {
      setCreatedInvoice(res.invoice);
      setIsDone(true);
      onSuccess({ invoice: res.invoice });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2C2526]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#800F2F] text-[#F8F5F0] p-4 flex items-center justify-between border-b border-[#D4AF37]">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
            <h2 className="font-serif text-base font-bold tracking-wide">
              Mubarak! Mark as Rishta Done
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[#660A22] text-[#E5DFD5]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isDone && createdInvoice ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#D4AF37]/20 text-[#800F2F] border border-[#D4AF37] flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-[#800F2F]" />
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-[#800F2F]">
                Rishta Finalized Successfully!
              </h3>
              <p className="text-xs text-[#6E6466] mt-1">
                Both profiles have been set to <strong>Engaged</strong> and removed from the active matching pool.
              </p>
            </div>

            <div className="p-4 bg-[#F8F5F0] rounded-xl border border-[#D4AF37]/40 text-left text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#6E6466]">Success Fee Invoice:</span>
                <span className="font-mono font-bold text-[#800F2F]">{createdInvoice.invoiceNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6E6466]">Billed To:</span>
                <span className="font-bold">{createdInvoice.clientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6E6466]">Amount Payable:</span>
                <span className="font-bold text-[#800F2F]">{formatPKR(createdInvoice.total)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Button variant="primary" onClick={onClose}>
                Close & Return to Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5 text-xs">
            <div className="p-4 bg-[#F8F5F0] rounded-xl border border-[#E5DFD5] space-y-2 text-center">
              <p className="font-serif font-bold text-base text-[#800F2F]">
                {proposal.profileAName} & {proposal.profileBName}
              </p>
              <p className="text-[11px] text-[#6E6466]">
                Confirming completion of this rishta will mark both parties as Engaged, exclude them from future match queries, and generate the bureau Success Fee invoice.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">
                Select Billed Client / Family for Success Fee:
              </label>
              <select
                value={billedPartyId}
                onChange={(e) => setBilledPartyId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] font-medium"
              >
                <option value={proposal.profileAId}>
                  Party A: {profileA?.name} ({profileA?.formNo})
                </option>
                <option value={proposal.profileBId}>
                  Party B: {profileB?.name} ({profileB?.formNo})
                </option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">
                Success Fee Amount (PKR):
              </label>
              <input
                type="number"
                step={5000}
                value={feeAmount}
                onChange={(e) => setFeeAmount(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] font-bold text-[#800F2F]"
              />
              <span className="text-[10px] text-[#6E6466] mt-1 block">
                Standard configured success fee is {formatPKR(settings.feeDefaults.successFee)}
              </span>
            </div>

            <div className="pt-3 border-t border-[#E5DFD5] flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                icon={<Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />}
              >
                Confirm Rishta Done & Generate Invoice
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

