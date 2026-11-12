'use client';

import jsPDF from 'jspdf';
import { BureauSettings, Profile } from './types';

export interface RishtayPDFOptions {
  fromDate?: string;
  toDate?: string;
  title?: string;
  bureauSettings: BureauSettings;
}

const COLORS = {
  maroon: [128, 15, 47] as [number, number, number],
  darkMaroon: [102, 10, 34] as [number, number, number],
  gold: [212, 175, 55] as [number, number, number],
  ivory: [248, 245, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  border: [229, 223, 213] as [number, number, number],
  text: [44, 37, 38] as [number, number, number],
  muted: [110, 100, 102] as [number, number, number],
};

/**
 * Resolve normalized YYYY-MM-DD date of a profile for reporting & filtering.
 */
export function getProfileDateKey(profile: Profile): string {
  const raw = profile.entryDate || profile.dateApplied || profile.createdAt || '';
  return raw.slice(0, 10);
}

/**
 * Filter profiles strictly within [fromDate, toDate] inclusive (if supplied).
 */
export function filterProfilesByDateRange(
  profiles: Profile[],
  fromDate?: string,
  toDate?: string
): Profile[] {
  return profiles.filter((p) => {
    const key = getProfileDateKey(p);
    if (!key) return !fromDate && !toDate;
    if (fromDate && key < fromDate) return false;
    if (toDate && key > toDate) return false;
    return true;
  });
}

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function getImageFormat(dataUrl: string): 'JPEG' | 'PNG' | 'WEBP' {
  if (dataUrl.startsWith('data:image/png')) return 'PNG';
  if (dataUrl.startsWith('data:image/webp')) return 'WEBP';
  return 'JPEG';
}

function formatPKRSimple(amount?: number): string {
  if (!amount) return 'N/A';
  return `PKR ${Number(amount).toLocaleString('en-US')}`;
}

function addPageFooters(doc: jsPDF, bureauName: string, bureauPhone: string) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(12, pageHeight - 13, pageWidth - 12, pageHeight - 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(`${bureauName}  |  ${bureauPhone}  |  Confidential Inventory`, 12, pageHeight - 8);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 12, pageHeight - 8, { align: 'right' });
  }
}

function drawDocumentHeader(
  doc: jsPDF,
  bureau: BureauSettings,
  logoDataUrl: string | null,
  title: string,
  subtitle: string
): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Top maroon strip
  doc.setFillColor(...COLORS.maroon);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Gold accent bottom border of header
  doc.setFillColor(...COLORS.gold);
  doc.rect(0, 28, pageWidth, 1.2, 'F');

  let textStartX = 14;
  if (logoDataUrl) {
    try {
      doc.setFillColor(...COLORS.white);
      doc.roundedRect(12, 4, 20, 20, 2, 2, 'F');
      doc.addImage(logoDataUrl, getImageFormat(logoDataUrl), 13, 5, 18, 18);
      textStartX = 36;
    } catch {
      // ignore if image fails
    }
  }

  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(bureau.bureauName || 'Kiran Marriage Bureau', textStartX, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(240, 213, 138);
  doc.text(`${bureau.address || 'Lahore, Pakistan'}  •  ${bureau.phone1 || ''}`, textStartX, 18);

  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(title, pageWidth - 12, 12, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(240, 213, 138);
  doc.text(subtitle, pageWidth - 12, 18, { align: 'right' });

  return 35;
}

function drawSectionBanner(doc: jsPDF, y: number, title: string, count: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(...COLORS.darkMaroon);
  doc.roundedRect(12, y, pageWidth - 24, 9, 1.5, 1.5, 'F');
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.4);
  doc.roundedRect(12, y, pageWidth - 24, 9, 1.5, 1.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.gold);
  doc.text(title, 16, y + 6);

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.white);
  doc.text(`${count} Profile${count === 1 ? '' : 's'}`, pageWidth - 16, y + 6, { align: 'right' });

  return y + 12.5;
}

function drawProfileRowCard(doc: jsPDF, p: Profile, index: number, y: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const cardWidth = pageWidth - 24;
  const cardHeight = 32;

  // Card background (zebra ivory tint)
  doc.setFillColor(...(index % 2 === 0 ? COLORS.white : COLORS.ivory));
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(12, y, cardWidth, cardHeight, 1.5, 1.5, 'FD');

  // Photo box on left
  const photoX = 15;
  const photoY = y + 3;
  const photoSize = 26;

  doc.setDrawColor(...(p.premiumMember ? COLORS.gold : COLORS.border));
  doc.setLineWidth(p.premiumMember ? 0.6 : 0.3);
  if (p.photoUrl && p.photoUrl.startsWith('data:image')) {
    try {
      doc.addImage(p.photoUrl, getImageFormat(p.photoUrl), photoX, photoY, photoSize, photoSize);
      doc.rect(photoX, photoY, photoSize, photoSize, 'S');
    } catch {
      drawInitialBox(doc, p.name, photoX, photoY, photoSize);
    }
  } else {
    drawInitialBox(doc, p.name, photoX, photoY, photoSize);
  }

  const infoX = photoX + photoSize + 4;
  const maxInfoW = cardWidth - photoSize - 12;

  // Row 1: Register/Form No + Real Name + Date & Status on right
  doc.setFillColor(...COLORS.maroon);
  doc.roundedRect(infoX, y + 3.2, 23, 5.2, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...COLORS.gold);
  doc.text(p.formNo || 'KMB-0000', infoX + 11.5, y + 6.8, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...COLORS.text);
  const nameLabel = p.premiumMember ? `${p.name}  [PREMIUM]` : p.name;
  doc.text(nameLabel, infoX + 25.5, y + 7);

  // Right aligned Entry Date & Status
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(...COLORS.muted);
  const statusText = (p.status || 'available').replace(/_/g, ' ').toUpperCase();
  doc.text(
    `Date: ${getProfileDateKey(p) || 'N/A'}  |  Status: ${statusText}`,
    12 + cardWidth - 3,
    y + 6.8,
    { align: 'right' }
  );

  // Divider line inside card
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(infoX, y + 10, 12 + cardWidth - 3, y + 10);

  // Row 2: Key Biodata columns
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.text);

  const line1 = `Age/Height: ${p.age} yrs, ${p.height || '-'}  |  Marital: ${p.maritalStatus}  |  Caste/Sect: ${p.caste} (${p.maslak})`;
  const line2 = `Education: ${p.degree || p.educationLevel}  |  Profession: ${p.profession || '-'} (${formatPKRSimple(p.monthlyIncome)})`;
  const line3 = `City: ${p.city}${p.societyName ? `, ${p.societyName}` : ''}  |  Phone: ${p.phone}${p.guardianPhone ? `  |  Guardian: ${p.guardianPhone}` : ''}`;

  const wrapped1 = doc.splitTextToSize(line1, maxInfoW);
  const wrapped2 = doc.splitTextToSize(line2, maxInfoW);
  const wrapped3 = doc.splitTextToSize(line3, maxInfoW);

  doc.text(wrapped1[0] || '', infoX, y + 15.2);
  doc.text(wrapped2[0] || '', infoX, y + 20.5);
  doc.setTextColor(...COLORS.muted);
  doc.text(wrapped3[0] || '', infoX, y + 25.8);

  return y + cardHeight + 3;
}

function drawInitialBox(doc: jsPDF, name: string, x: number, y: number, size: number) {
  doc.setFillColor(...COLORS.maroon);
  doc.rect(x, y, size, size, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.gold);
  const letter = (name || '?').trim().charAt(0).toUpperCase() || '?';
  doc.text(letter, x + size / 2, y + size / 2 + 4.5, { align: 'center' });
}

/**
 * Download an organized PDF list of rishtas (optionally filtered by fromDate..toDate),
 * cleanly divided into separate Male and Female sections.
 */
export async function exportRishtayPDF(
  allProfiles: Profile[],
  options: RishtayPDFOptions
): Promise<{ total: number; maleCount: number; femaleCount: number; fileName: string }> {
  const { fromDate, toDate, title, bureauSettings } = options;
  const filtered = filterProfilesByDateRange(allProfiles, fromDate, toDate);
  const maleProfiles = filtered.filter((p) => p.gender === 'Male');
  const femaleProfiles = filtered.filter((p) => p.gender === 'Female');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const logoDataUrl = await loadImageAsDataUrl('/brand/logo-print.png');

  const dateRangeLabel =
    fromDate && toDate
      ? `Period: ${fromDate} to ${toDate}`
      : fromDate
      ? `From: ${fromDate}`
      : toDate
      ? `Up to: ${toDate}`
      : 'All Recorded Dates';

  const headerTitle = title || 'Rishta Inventory Directory';
  let y = drawDocumentHeader(
    doc,
    bureauSettings,
    logoDataUrl,
    headerTitle,
    `${dateRangeLabel}  |  Generated: ${new Date().toISOString().split('T')[0]}`
  );

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Summary KPI bar
  doc.setFillColor(...COLORS.ivory);
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.4);
  doc.roundedRect(12, y, pageWidth - 24, 11, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.maroon);
  doc.text(
    `Total Rishtay: ${filtered.length}    •    Male Section: ${maleProfiles.length}    •    Female Section: ${femaleProfiles.length}`,
    pageWidth / 2,
    y + 7,
    { align: 'center' }
  );
  y += 15;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 17) {
      doc.addPage();
      y = drawDocumentHeader(
        doc,
        bureauSettings,
        logoDataUrl,
        headerTitle,
        `${dateRangeLabel} (Cont.)`
      );
    }
  };

  if (filtered.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.muted);
    doc.text('No rishtay records found for the selected date range.', pageWidth / 2, y + 18, {
      align: 'center',
    });
  } else {
    // SECTION A: MALE RISHTAY
    ensureSpace(45);
    y = drawSectionBanner(doc, y, 'SECTION A: MALE RISHTAY (GROOMS)', maleProfiles.length);
    if (maleProfiles.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.muted);
      doc.text('No male profiles in this selection.', 16, y + 4);
      y += 11;
    } else {
      for (let i = 0; i < maleProfiles.length; i++) {
        ensureSpace(36);
        y = drawProfileRowCard(doc, maleProfiles[i], i, y);
      }
      y += 4;
    }

    // SECTION B: FEMALE RISHTAY
    ensureSpace(45);
    y = drawSectionBanner(doc, y, 'SECTION B: FEMALE RISHTAY (BRIDES)', femaleProfiles.length);
    if (femaleProfiles.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.muted);
      doc.text('No female profiles in this selection.', 16, y + 4);
      y += 11;
    } else {
      for (let i = 0; i < femaleProfiles.length; i++) {
        ensureSpace(36);
        y = drawProfileRowCard(doc, femaleProfiles[i], i, y);
      }
    }
  }

  addPageFooters(doc, bureauSettings.bureauName, bureauSettings.phone1);

  const fileSlug =
    fromDate || toDate
      ? `${fromDate || 'start'}-to-${toDate || 'today'}`
      : 'all-rishtay';
  const fileName = `KMB-Rishtay-${fileSlug}.pdf`;
  doc.save(fileName);

  return {
    total: filtered.length,
    maleCount: maleProfiles.length,
    femaleCount: femaleProfiles.length,
    fileName,
  };
}

/**
 * Download an official A4 Biodata PDF for a single candidate (includes Register/Form No, Real Name, and Photo).
 */
export async function exportSingleProfilePDF(
  profile: Profile,
  bureauSettings: BureauSettings
): Promise<string> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const logoDataUrl = await loadImageAsDataUrl('/brand/logo-print.png');
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = drawDocumentHeader(
    doc,
    bureauSettings,
    logoDataUrl,
    `Official Candidate Biodata`,
    `Register / Form No: ${profile.formNo}  |  Entry Date: ${getProfileDateKey(profile)}`
  );

  // Top Candidate Card with Photo
  doc.setFillColor(...COLORS.ivory);
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.5);
  doc.roundedRect(12, y, pageWidth - 24, 42, 2, 2, 'FD');

  const photoX = 16;
  const photoY = y + 4;
  const photoSize = 34;
  if (profile.photoUrl && profile.photoUrl.startsWith('data:image')) {
    try {
      doc.addImage(profile.photoUrl, getImageFormat(profile.photoUrl), photoX, photoY, photoSize, photoSize);
      doc.setDrawColor(...COLORS.gold);
      doc.rect(photoX, photoY, photoSize, photoSize, 'S');
    } catch {
      drawInitialBox(doc, profile.name, photoX, photoY, photoSize);
    }
  } else {
    drawInitialBox(doc, profile.name, photoX, photoY, photoSize);
  }

  const infoX = photoX + photoSize + 6;
  doc.setFillColor(...COLORS.maroon);
  doc.roundedRect(infoX, y + 5, 34, 6, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.gold);
  doc.text(`REG: ${profile.formNo}`, infoX + 17, y + 9.2, { align: 'center' });

  if (profile.premiumMember) {
    doc.setFillColor(...COLORS.gold);
    doc.roundedRect(infoX + 36, y + 5, 28, 6, 1, 1, 'F');
    doc.setTextColor(...COLORS.maroon);
    doc.text('PREMIUM', infoX + 50, y + 9.2, { align: 'center' });
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.maroon);
  doc.text(profile.name, infoX, y + 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.text);
  doc.text(
    `${profile.gender}  •  ${profile.age} Years  •  ${profile.height || '-'}  •  ${profile.maritalStatus}`,
    infoX,
    y + 26
  );
  doc.text(
    `${profile.city}${profile.societyName ? `, ${profile.societyName}` : ''}  •  ${profile.caste} (${profile.maslak})`,
    infoX,
    y + 32
  );
  doc.setTextColor(...COLORS.muted);
  doc.text(
    `Applied By: ${profile.appliedBy}  •  Status: ${(profile.status || 'available').toUpperCase()}`,
    infoX,
    y + 38
  );

  y += 48;

  const drawKeyValSection = (secTitle: string, rows: [string, string][]) => {
    doc.setFillColor(...COLORS.maroon);
    doc.roundedRect(12, y, pageWidth - 24, 7.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.gold);
    doc.text(secTitle, 15, y + 5.2);
    y += 10;

    rows.forEach(([label, val], idx) => {
      doc.setFillColor(...(idx % 2 === 0 ? COLORS.white : COLORS.ivory));
      doc.rect(12, y, pageWidth - 24, 7, 'F');
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.2);
      doc.line(12, y + 7, pageWidth - 12, y + 7);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...COLORS.muted);
      doc.text(label, 15, y + 4.8);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.text);
      const valLines = doc.splitTextToSize(val || '-', pageWidth - 78);
      doc.text(valLines[0] || '-', 65, y + 4.8);
      y += 7;
    });
    y += 5;
  };

  drawKeyValSection('1. EDUCATION & PROFESSION', [
    ['Degree / Level', `${profile.degree || '-'} (${profile.educationLevel})`],
    ['Profession', `${profile.profession || '-'}${profile.designation ? ` — ${profile.designation}` : ''}`],
    ['Monthly Income', formatPKRSimple(profile.monthlyIncome)],
  ]);

  drawKeyValSection('2. FAMILY & RELIGION', [
    ['Religion & Sect', `${profile.religion}  •  ${profile.maslak}`],
    ['Caste / Biradari', profile.caste || '-'],
    ['Father', `${profile.fatherName || '-'} (${profile.fatherOccupation || '-'})`],
    ['Mother', `${profile.motherName || '-'} (${profile.motherOccupation || '-'})`],
    ['Siblings', `Total ${profile.totalSiblings} (${profile.brothersCount} Brothers, ${profile.sistersCount} Sisters, ${profile.marriedSiblingsCount} Married)`],
  ]);

  drawKeyValSection('3. CONTACT & PARTNER PREFERENCES', [
    ['Phone / WhatsApp', `${profile.phone}${profile.whatsapp ? `  |  WA: ${profile.whatsapp}` : ''}`],
    ['Guardian Contact', `${profile.guardianName || '-'} (${profile.guardianPhone || '-'})`],
    ['Address', profile.address || '-'],
    [
      'Desired Partner',
      `Age ${profile.preferences?.ageMin}-${profile.preferences?.ageMax} yrs, Height ${profile.preferences?.heightMin}-${profile.preferences?.heightMax}, Cities: ${profile.preferences?.cities?.join(', ') || 'Any'}, Min Edu: ${profile.preferences?.educationMin || 'Any'}`,
    ],
    ['Preference Notes', profile.preferences?.otherNotes || '-'],
  ]);

  addPageFooters(doc, bureauSettings.bureauName, bureauSettings.phone1);

  const safeName = profile.name.replace(/[^a-zA-Z0-9_-]+/g, '_');
  const fileName = `${profile.formNo}-${safeName}-Biodata.pdf`;
  doc.save(fileName);
  return fileName;
}

