'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { LanguageToggle } from '@/components/brand/LanguageToggle';
import { Button } from '@/components/ui/Button';
import { store } from '@/lib/db/store';
import { useLanguage } from '@/lib/useLanguage';
import { Lock, Mail, Shield, AlertCircle, User, Phone, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { tr } = useLanguage();

  const [checking, setChecking] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Initial Admin setup state
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/session', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (!active) return;
        if (data?.user) {
          store.setCurrentUser(data.user);
          router.replace('/dashboard');
          return;
        }
        setSetupRequired(Boolean(data?.setupRequired));
        setChecking(false);
      })
      .catch(() => {
        if (!active) return;
        setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data?.code === 'PENDING_APPROVAL') {
          setError(
            tr(
              'Your account is awaiting Administrator approval. Please ask Admin to approve your email.',
              'آپ کا اکاؤنٹ ابھی ایڈمن کی منظوری کا منتظر ہے۔ برائے مہربانی ایڈمن سے منظوری لیں۔'
            )
          );
        } else if (data?.code === 'DISABLED') {
          setError(
            tr(
              'Your account has been disabled by the Administrator.',
              'آپ کا اکاؤنٹ ایڈمن کی جانب سے غیر فعال کر دیا گیا ہے۔'
            )
          );
        } else if (data?.code === 'REJECTED') {
          setError(
            tr(
              'Your account access was declined by the Administrator.',
              'آپ کے اکاؤنٹ کی رسائی ایڈمن کی جانب سے مسترد کر دی گئی ہے۔'
            )
          );
        } else {
          setError(
            tr(
              'Invalid email or password. Only Admin-approved accounts can sign in.',
              'ای میل یا پاس ورڈ غلط ہے۔ صرف ایڈمن کے منظور کردہ اکاؤنٹس ہی لاگ ان ہو سکتے ہیں۔'
            )
          );
        }
        setLoading(false);
        return;
      }

      store.setCurrentUser(data.user);
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError(tr('Network error while authenticating. Please try again.', 'تصدیق کے دوران نیٹ ورک خرابی پیش آئی۔ دوبارہ کوشش کریں۔'));
      setLoading(false);
    }
  };

  const handleSetupAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(tr('Password must be at least 6 characters long.', 'پاس ورڈ کم از کم 6 حروف کا ہونا ضروری ہے۔'));
      return;
    }
    if (password !== confirmPassword) {
      setError(tr('Passwords do not match.', 'دونوں پاس ورڈ آپس میں نہیں ملتے۔'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminName.trim(),
          email: email.trim(),
          phone: adminPhone.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || tr('Could not complete Admin setup.', 'ایڈمن اکاؤنٹ مکمل نہیں ہو سکا۔'));
        setLoading(false);
        return;
      }

      store.setCurrentUser(data.user);
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError(tr('Network error during Admin setup.', 'ایڈمن سیٹ اپ کے دوران نیٹ ورک خرابی۔'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#800F2F] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Ornament */}
      <div className="absolute inset-0 bg-ornament opacity-25 pointer-events-none" />

      <div className="relative z-10 mb-4 flex justify-end w-full max-w-md">
        <LanguageToggle variant="maroon" />
      </div>

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md bg-[#FFFFFF] border-2 border-[#D4AF37] rounded-3xl shadow-2xl overflow-hidden">
        {/* Card Header on Deep Maroon */}
        <div className="bg-[#660A22] p-6 text-center border-b border-[#D4AF37]/40 space-y-3">
          <BrandLogo variant="banner" width={300} height={100} priority />
          <div>
            <h1 className="font-serif text-lg font-bold text-[#F8F5F0] tracking-wide">
              {setupRequired
                ? tr('Master Admin Account Setup', 'مرکزی ایڈمن اکاؤنٹ سیٹ اپ')
                : tr('Bureau Admin & Team Portal', 'بیورو ایڈمن اور ٹیم پورٹل')}
            </h1>
            <p className="font-urdu text-xs text-[#D4AF37]">
              {setupRequired
                ? 'پہلی بار سسٹم شروع کرنے کے لیے ایڈمن آئی ڈی اور پاس ورڈ بنائیں'
                : 'مجاز ایڈمن اور منظور شدہ عملے کے لیے محفوظ لاگ ان'}
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-7 space-y-5">
          {checking ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-[#800F2F] rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#6E6466]">
                {tr('Verifying secure portal session...', 'محفوظ سیشن کی تصدیق ہو رہی ہے...')}
              </p>
            </div>
          ) : setupRequired ? (
            <>
              <div className="p-3 bg-[#F8F5F0] border border-[#D4AF37] rounded-xl text-xs text-[#2C2526] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#800F2F] shrink-0 mt-0.5" />
                <span>
                  {tr(
                    'Create your Owner/Admin login ID and password. Once created, self-signup stays permanently locked and only Admin can add or approve team members by email.',
                    'اپنا مالک/ایڈمن لاگ ان آئی ڈی اور پاس ورڈ بنائیں۔ اس کے بعد کوئی خود اکاؤنٹ نہیں بنا سکے گا، صرف ایڈمن ہی ای میل سے ٹیم ممبرز شامل اور منظور کرے گا۔'
                  )}
                </span>
              </div>

              {error && (
                <div className="p-3 bg-[#F8F5F0] border border-[#A3182E] rounded-xl flex items-center gap-2 text-xs text-[#A3182E]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSetupAdmin} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-[#800F2F] mb-1">
                    {tr('Admin Full Name', 'ایڈمن کا مکمل نام')} *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#6E6466] absolute start-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder={tr('e.g. Kiran Shah (Owner)', 'مثال: کرن شاہ (مالک)')}
                      className="w-full ps-9 pe-3 py-2.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#800F2F] mb-1">
                    {tr('Admin Email / Login ID', 'ایڈمن ای میل / لاگ ان آئی ڈی')} *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#6E6466] absolute start-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      dir="ltr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@yourdomain.com"
                      className="w-full ps-9 pe-3 py-2.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#800F2F] mb-1">
                    {tr('Phone / WhatsApp (Optional)', 'فون / واٹس ایپ (اختیاری)')}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#6E6466] absolute start-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      dir="ltr"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      placeholder="+92 300 0000000"
                      className="w-full ps-9 pe-3 py-2.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#800F2F] mb-1">
                    {tr('Create Admin Password (min 6 chars)', 'ایڈمن پاس ورڈ بنائیں (کم از کم 6 حروف)')} *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6E6466] absolute start-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      dir="ltr"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full ps-9 pe-9 py-2.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-[#6E6466] hover:text-[#800F2F]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#800F2F] mb-1">
                    {tr('Confirm Password', 'پاس ورڈ دوبارہ درج کریں')} *
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#6E6466] absolute start-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      dir="ltr"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full ps-9 pe-3 py-2.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
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
                  {loading
                    ? tr('Creating Admin Account...', 'ایڈمن اکاؤنٹ بن رہا ہے...')
                    : tr('Create Admin & Enter System', 'ایڈمن اکاؤنٹ بنائیں اور داخل ہوں')}
                </Button>
              </form>
            </>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-[#F8F5F0] border border-[#A3182E] rounded-xl flex items-center gap-2 text-xs text-[#A3182E]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#800F2F] mb-1">
                    {tr('Admin or Approved Staff Email', 'ایڈمن یا منظور شدہ عملے کا ای میل')}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#6E6466] absolute start-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      dir="ltr"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@yourdomain.com"
                      className="w-full ps-9 pe-3 py-2.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#800F2F] mb-1">
                    {tr('Password', 'پاس ورڈ')}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6E6466] absolute start-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      dir="ltr"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full ps-9 pe-9 py-2.5 rounded-lg border border-[#E5DFD5] bg-[#F8F5F0] text-[#2C2526] focus:border-[#D4AF37] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-[#6E6466] hover:text-[#800F2F]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full py-2.5 mt-2"
                  icon={<Shield className="w-4 h-4 text-[#D4AF37]" />}
                >
                  {loading
                    ? tr('Authenticating...', 'تصدیق ہو رہی ہے...')
                    : tr('Sign In to Bureau System', 'بیورو سسٹم میں لاگ ان کریں')}
                </Button>
              </form>

              <div className="p-3 bg-[#F8F5F0] border border-[#E5DFD5] rounded-xl text-[11px] text-[#6E6466] text-center leading-relaxed">
                {tr(
                  'Private ERP Portal — Self-registration is disabled. Only accounts created and approved by the Administrator can access this system.',
                  'نجی ای آر پی پورٹل — صارف خود اکاؤنٹ نہیں بنا سکتا۔ صرف ایڈمن کے بنائے اور منظور کردہ اکاؤنٹس ہی اس سسٹم میں داخل ہو سکتے ہیں۔'
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
