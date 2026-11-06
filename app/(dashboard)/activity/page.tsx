'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { store } from '@/lib/db/store';
import { ActivityLogEntry } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  User, 
  Boxes, 
  Receipt, 
  HeartHandshake, 
  Settings, 
  Clock, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

function ActivityContent() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterActor, setFilterActor] = useState<string>('all');

  useEffect(() => {
    const update = () => {
      setLogs(store.getAuditLogs());
    };
    update();
    const unsub = store.subscribe(update);
    return unsub;
  }, []);

  const actors = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => {
      if (l.actorName) set.add(l.actorName);
    });
    return Array.from(set);
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = 
          l.details.toLowerCase().includes(q) ||
          l.actorName.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.entity.toLowerCase().includes(q) ||
          (l.entityId && l.entityId.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (filterEntity !== 'all') {
        if (filterEntity === 'rishta' && l.entity !== 'rishta' && (l.entity as any) !== 'profile') return false;
        else if (filterEntity !== 'rishta' && l.entity !== filterEntity) return false;
      }

      if (filterAction !== 'all' && l.action !== filterAction) return false;
      if (filterActor !== 'all' && l.actorName !== filterActor) return false;

      return true;
    });
  }, [logs, searchTerm, filterEntity, filterAction, filterActor]);

  const exportCSV = () => {
    const headers = ['Timestamp', 'Actor', 'Role', 'Entity', 'Entity ID', 'Action', 'Details'];
    const rows = filteredLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.actorName}"`,
      `"${l.actorRole}"`,
      `"${l.entity}"`,
      `"${l.entityId || ''}"`,
      `"${l.action}"`,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kiran_activity_ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'rishta':
      case 'profile':
        return <Boxes className="w-3.5 h-3.5 text-[#5A0A14]" />;
      case 'invoice':
        return <Receipt className="w-3.5 h-3.5 text-[#5A0A14]" />;
      case 'proposal':
        return <HeartHandshake className="w-3.5 h-3.5 text-[#5A0A14]" />;
      case 'settings':
        return <Settings className="w-3.5 h-3.5 text-[#5A0A14]" />;
      default:
        return <History className="w-3.5 h-3.5 text-[#7B5E5E]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDF8] p-5 rounded-xl border border-[#E9DDC3] shadow-sm">
        <div>
          <span className="text-[10px] uppercase font-serif font-bold tracking-widest text-[#B08626]">
            Immutable Bureau Audit Log
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#5A0A14] mt-0.5">
            Activity Ledger
          </h1>
          <p className="text-xs text-[#7B5E5E]">
            Chronological audit trail of all profile registrations, status changes, proposals, and fee payments.
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={exportCSV}
          icon={<Download className="w-3.5 h-3.5 text-[#5A0A14]" />}
        >
          Export Audit Trail
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#FFFDF8] p-3 rounded-xl border border-[#E9DDC3] flex items-center gap-3 flex-wrap text-xs">
        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-3.5 h-3.5 text-[#7B5E5E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search activity by keyword, form number, actor..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#FBF4E6] border border-[#E9DDC3] text-xs text-[#2A0A0F] focus:outline-none"
          />
        </div>

        {/* Entity filter */}
        <div className="flex items-center gap-1">
          <span className="text-[#7B5E5E] font-medium">Entity:</span>
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#FBF4E6] border border-[#E9DDC3] text-xs font-semibold text-[#5A0A14] focus:outline-none"
          >
            <option value="all">All Entities</option>
            <option value="rishta">Rishta Profiles</option>
            <option value="invoice">Invoices & Payments</option>
            <option value="proposal">Proposals</option>
            <option value="settings">Settings</option>
            <option value="staff">Staff Accounts</option>
          </select>
        </div>

        {/* Action filter */}
        <div className="flex items-center gap-1">
          <span className="text-[#7B5E5E] font-medium">Action:</span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#FBF4E6] border border-[#E9DDC3] text-xs font-semibold text-[#5A0A14] focus:outline-none"
          >
            <option value="all">All Actions</option>
            <option value="create">Created</option>
            <option value="edit">Edited</option>
            <option value="status_change">Status Change</option>
            <option value="payment">Payment</option>
            <option value="delete">Deleted</option>
          </select>
        </div>

        {/* Actor filter */}
        <div className="flex items-center gap-1">
          <span className="text-[#7B5E5E] font-medium">Actor:</span>
          <select
            value={filterActor}
            onChange={(e) => setFilterActor(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#FBF4E6] border border-[#E9DDC3] text-xs font-semibold text-[#5A0A14] focus:outline-none"
          >
            <option value="all">All Staff</option>
            {actors.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#FFFDF8] border border-[#E9DDC3] rounded-xl shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#5A0A14] text-[#FBF4E6] text-[11px] uppercase font-semibold">
              <th className="p-3 w-40">Timestamp</th>
              <th className="p-3 w-36">Staff Member</th>
              <th className="p-3 w-28">Entity</th>
              <th className="p-3 w-28">Action</th>
              <th className="p-3">Details & Audit Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9DDC3]">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[#7B5E5E]">
                  No activity log entries found matching criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, idx) => (
                <tr key={log.id} className={idx % 2 === 0 ? 'bg-[#FFFDF8]' : 'bg-[#FAF6EC]'}>
                  <td className="p-3 whitespace-nowrap text-[#7B5E5E] font-mono text-[11px]">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-[#5A0A14] text-[#D9A93F] flex items-center justify-center font-bold text-[10px]">
                        {log.actorName ? log.actorName.charAt(0) : 'S'}
                      </div>
                      <div>
                        <span className="font-semibold text-[#2A0A0F] block leading-tight">{log.actorName}</span>
                        <span className="text-[9px] text-[#7B5E5E] uppercase">{log.actorRole}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 capitalize font-medium text-[#2A0A0F]">
                      {getEntityIcon(log.entity)}
                      <span>{log.entity}</span>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#FBF4E6] text-[#5A0A14] border border-[#E9DDC3] uppercase">
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-[#2A0A0F] leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ActivityPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#7B5E5E]">Loading Activity Ledger...</div>}>
      <ActivityContent />
    </Suspense>
  );
}

