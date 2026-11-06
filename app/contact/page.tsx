'use client';

import React, { useState } from 'react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Button } from '@/components/ui/Button';
import { store } from '@/lib/db/store';
import { generateWhatsAppLink } from '@/lib/utils';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const settings = store.getSettings();
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: 'Lahore',
    inquiry: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF4E6] text-[#2A0A0F]">
      <PublicNavbar />

      <section className="bg-[#5A0A14] text-[#FBF4E6] py-16 px-4 text-center border-b border-[#D9A93F]/40">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="text-xs uppercase font-serif tracking-widest text-[#D9A93F] font-bold">
            Lahore Office & WhatsApp Support
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold">
            Contact Kiran Marriage Bureau
          </h1>
          <p className="font-urdu text-lg sm:text-2xl text-[#D9A93F]">
            ہم سے رابطہ کریں - باوقار رہنمائی اور مشاورت کے لیے
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-5xl mx-auto py-14 px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Office Details */}
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#5A0A14]">
                Lahore Matrimonial Bureau Office
              </h2>
              <p className="text-xs text-[#7B5E5E] mt-1 leading-relaxed">
                Families are welcome to visit our executive matrimonial center in Gulberg, Lahore. Please book an appointment in advance so we can reserve a private consultation room for your family.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC3] space-y-4 shadow-sm text-xs text-[#2A0A0F]">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#D9A93F] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#5A0A14]">Office Address:</strong>
                  <span>{settings.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#D9A93F] shrink-0" />
                <div>
                  <strong className="block text-[#5A0A14]">Telephone Lines:</strong>
                  <span>{settings.phone1} / {settings.phone2}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-[#D9A93F] shrink-0" />
                <div>
                  <strong className="block text-[#5A0A14]">WhatsApp Official:</strong>
                  <span>{settings.whatsapp}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#D9A93F] shrink-0" />
                <div>
                  <strong className="block text-[#5A0A14]">Visiting Hours:</strong>
                  <span>Monday to Saturday: 11:00 AM – 7:00 PM (By Appointment)</span>
                </div>
              </div>
            </div>

            <a
              href={generateWhatsAppLink(
                settings.whatsapp,
                'Assalam-o-Alaikum, I want to book an appointment at Kiran Marriage Bureau Lahore.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button size="lg" variant="primary" className="w-full" icon={<MessageSquare className="w-4 h-4 text-[#D9A93F]" />}>
                Instant Appointment on WhatsApp
              </Button>
            </a>
          </div>

          {/* Inquiry Form */}
          <div className="p-8 rounded-2xl bg-[#FFFDF8] border border-[#E9DDC3] shadow-md space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#5A0A14]">
              Send a Confidential Inquiry
            </h3>
            <p className="text-xs text-[#7B5E5E]">
              Our senior coordinator will reply to your family via WhatsApp or phone.
            </p>

            {sent ? (
              <div className="p-6 bg-[#FBF4E6] rounded-xl border border-[#D9A93F] text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#5A0A14] mx-auto" />
                <h4 className="font-serif text-base font-bold text-[#5A0A14]">
                  Inquiry Received!
                </h4>
                <p className="text-xs text-[#7B5E5E]">
                  JazakAllah. A matrimonial consultant from our Lahore office will contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#5A0A14] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Haji Muhammad Aslam"
                    className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5A0A14] mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0300 1234567"
                    className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5A0A14] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5A0A14] mb-1">
                    Inquiry Details / Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.inquiry}
                    onChange={(e) => setFormData({ ...formData, inquiry: e.target.value })}
                    placeholder="Please specify candidate age, profession, caste preference..."
                    className="w-full px-3 py-2 rounded-lg border border-[#E9DDC3] bg-[#FBF4E6] text-[#2A0A0F]"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full" icon={<Send className="w-4 h-4 text-[#D9A93F]" />}>
                  Submit Inquiry
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
