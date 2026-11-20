'use client';

import React, { useState, useEffect } from 'react';
import { Edit3, RotateCcw } from 'lucide-react';

export interface SelectOption {
  value: string;
  labelEn: string;
  labelUr?: string;
}

export interface ManualSelectProps {
  label: string;
  urduLabel?: string;
  required?: boolean;
  value: string | undefined;
  onChange: (val: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  manualPlaceholder?: string;
  lang?: 'en' | 'ur';
  className?: string;
  helperText?: string;
}

export function ManualSelect({
  label,
  urduLabel,
  required = false,
  value,
  onChange,
  options,
  placeholder,
  manualPlaceholder,
  lang = 'en',
  className = '',
  helperText,
}: ManualSelectProps) {
  // Normalize options into { value, label }
  const normalizedOptions: { value: string; label: string }[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return {
      value: opt.value,
      label: lang === 'ur' && opt.labelUr ? opt.labelUr : opt.labelEn,
    };
  });

  const predefinedValues = normalizedOptions.map((o) => o.value);
  const isValuePredefined = Boolean(value && predefinedValues.includes(value));

  // If value is not empty and not in the predefined list, it's a manual value
  const [isManual, setIsManual] = useState<boolean>(!isValuePredefined && Boolean(value));
  const [typedValue, setTypedValue] = useState<string>(!isValuePredefined ? (value || '') : '');

  // Keep manual mode in sync if value changes externally (e.g., initialData loaded)
  useEffect(() => {
    if (value !== undefined) {
      const match = predefinedValues.includes(value);
      if (!match && value !== '') {
        setIsManual(true);
        setTypedValue(value);
      } else if (match && !isManual) {
        setTypedValue('');
      }
    }
  }, [value]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === '__manual__') {
      setIsManual(true);
      const initialManual = typedValue || '';
      onChange(initialManual);
    } else {
      setIsManual(false);
      onChange(selected);
    }
  };

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTypedValue(val);
    onChange(val);
  };

  const switchToManual = () => {
    setIsManual(true);
    onChange(typedValue || '');
  };

  const switchToList = () => {
    setIsManual(false);
    const fallback = predefinedValues[0] || '';
    onChange(fallback);
  };

  const manualOptionText =
    lang === 'ur'
      ? '✍️ ہاتھ سے لکھیں / دیگر (Manual Type)...'
      : '✍️ Other / Manual Type...';

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-semibold text-[#800F2F]">
          {label} {required && <span className="text-[#A3182E]">*</span>}
          {urduLabel && lang === 'en' && (
            <span className="text-[10px] text-[#6E6466] font-urdu ml-1.5 font-normal">
              ({urduLabel})
            </span>
          )}
        </label>

        <button
          type="button"
          onClick={isManual ? switchToList : switchToManual}
          className="text-[10px] font-semibold text-[#B88B22] hover:text-[#800F2F] flex items-center gap-1 transition-colors underline cursor-pointer"
        >
          {isManual ? (
            <>
              <RotateCcw className="w-2.5 h-2.5" />
              <span>{lang === 'ur' ? 'فہرست سے چنیں' : 'Choose from List'}</span>
            </>
          ) : (
            <>
              <Edit3 className="w-2.5 h-2.5" />
              <span>{lang === 'ur' ? 'ہاتھ سے لکھیں' : 'Manual Type'}</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-1.5">
        <select
          required={required && !isManual}
          value={isManual ? '__manual__' : (value || '')}
          onChange={handleSelectChange}
          className={`w-full px-3 py-2 text-xs rounded-lg border ${
            isManual ? 'border-[#D4AF37] bg-[#F8F5F0]/80' : 'border-[#E5DFD5] bg-[#F8F5F0]'
          } text-[#2C2526] focus:border-[#D4AF37] focus:outline-none transition-colors font-medium`}
        >
          {placeholder && !value && !isManual && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {normalizedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          <option value="__manual__" className="font-semibold text-[#800F2F]">
            {manualOptionText}
          </option>
        </select>

        {isManual && (
          <div className="flex items-center gap-1.5 animate-in fade-in duration-200">
            <input
              type="text"
              required={required}
              value={typedValue}
              onChange={handleManualInputChange}
              placeholder={
                manualPlaceholder ||
                (lang === 'ur' ? 'خود درج کریں (مثلاً قوم، ڈگری، شہر...)' : 'Type custom value here...')
              }
              className="w-full px-3 py-1.5 text-xs rounded-lg border-2 border-[#D4AF37] bg-[#FFFFFF] text-[#800F2F] font-semibold focus:outline-none focus:ring-1 focus:ring-[#800F2F] shadow-inner"
              autoFocus
            />
            <button
              type="button"
              onClick={switchToList}
              title={lang === 'ur' ? 'فہرست پر واپس جائیں' : 'Switch back to predefined list'}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-[#800F2F] bg-[#D4AF37]/20 hover:bg-[#D4AF37]/35 border border-[#D4AF37] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-[#800F2F]" />
              <span>{lang === 'ur' ? 'فہرست' : 'List'}</span>
            </button>
          </div>
        )}
      </div>

      {helperText && (
        <span className="text-[10px] text-[#6E6466] mt-0.5 block">{helperText}</span>
      )}
    </div>
  );
}
