'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Button } from '@/components/ui/Button';
import { store } from '@/lib/db/store';
import { Lock, Mail, Shield, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@kiranmarriagebureau.com');
  const [password, setPassword] = useState('kiran2026');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const staffMembers = store.getStaff();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const user = staffMembers.find(
      s => s.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (user && user.active) {
      store.setCurrentUser(user);
      router.push('/dashboard');
    } else {
      setError('Invalid staff credentials or account disabled. Please contact administrator.');
      setLoading(false);
    }
  };

  const quickLoginAs = (role: 'admin' | 'staff') => {
    const user = staffMembers.find(s => s.role === role);
    if (user) {
      setEmail(user.email);
      store.setCurrentUser(user);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#800F2F] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background Ornament */}
      <div className="absolute inset-0 bg-ornament opacity-25 pointer-events-none" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-[#FFFFFF] border-2 border-[#D4AF37] rounded-3xl shadow-2xl overflow-hidden">
        {/* Card Header on Deep Maroon */}
        <div className="bg-[#660A22] p-6 text-center border-b border-[#D4AF37]/40 space-y-3">
          <BrandLogo variant="banner" width={300} height={100} priority />
          <div>
            <h1 className="font-serif text-lg font-bold text-[#F8F5F0] tracking-wide">
              Bureau Staff & Admin Portal
            </h1>
            <p className="font-urdu text-xs text-[#D4AF37]">
              مجاز عملہ اور انتظامیہ کے لیے لاگ ان
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-[#F8F5F0] border border-[#A3182E] rounded-xl flex items-center gap-2 text-xs text-[#A3182E]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">
                Official Bureau Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6E6466] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kiranmarriagebureau.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#800F2F] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6E6466] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full py-2.5 mt-2"
              icon={<Shield className="w-4 h-4 text-[#D4AF37]" />}
            >
              {loading ? 'Authenticating...' : 'Sign In to Management System'}
            </Button>
          </form>

          {/* Quick Demo Role Selectors */}
          <div className="pt-4 border-t border-[#E5DFD5] space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#6E6466] block text-center">
              Quick One-Click Demo Sign In:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickLoginAs('admin')}
                className="py-2 px-3 rounded-lg bg-[#F8F5F0] hover:bg-[#E5DFD5] border border-[#D4AF37] text-xs font-bold text-[#800F2F] flex items-center justify-center gap-1 transition-colors"
              >
                <span>Admin Portal</span>
                <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
              </button>

              <button
                type="button"
                onClick={() => quickLoginAs('staff')}
                className="py-2 px-3 rounded-lg bg-[#F8F5F0] hover:bg-[#E5DFD5] border border-[#E5DFD5] text-xs font-semibold text-[#800F2F] flex items-center justify-center gap-1 transition-colors"
              >
                <span>Staff Portal</span>
                <ArrowRight className="w-3 h-3 text-[#6E6466]" />
              </button>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="p-3 bg-[#F8F5F0] border-t border-[#E5DFD5] text-center text-[11px] text-[#6E6466]">
          <Link href="/register" className="hover:text-[#800F2F] font-medium transition-colors">
            Open Standalone Online Registration Form (/register) →
          </Link>
        </div>
      </div>
    </div>
  );
}

