# Kiran Marriage Bureau Management System (Lahore, Pakistan)

A production-ready, full-stack matrimonial match-making and management web platform built specifically for **Kiran Marriage Bureau** (Jail Road, Gulberg V, Lahore, Pakistan).

Designed with a strict, dignified brand system matching the gold line-art couple logo, this system provides a bilingual public portal for Pakistani families, an online registration pipeline, an automated two-way matching engine, a real-time entry side panel, proposal tracking, and a complete multi-format invoice and receipting engine.

---

## 🌟 Key Modules & Capabilities

### 1. Brand Design System (Strict 3-Color Palette)
- **Deep Maroon (`#5A0A14`)**: Primary brand color (darker `#420610`, lighter `#7A1424`, alert `#8E1B2B`).
- **Antique Gold (`#D9A93F`)**: Accent color (light `#EBCB7C`, dark `#B08626`). Reserved strictly for Premium badges, active indicators, and highlights.
- **Ivory (`#FBF4E6`)**: Warm background (card `#FFFDF8`, border `#E9DDC3`, dark ring track `#DECEAC`).
- **Strict Color Rules**: Zero pink, magenta, blue, green, or red anywhere. Status is indicated by icons (gold check for success, gold star for premium, clock for pending, lighter maroon for rejection).
- **Typography**: Playfair Display / Cormorant Garamond headings, Inter body text, and **Noto Nastaliq Urdu** with native right-to-left (`dir="rtl"`) layout support.
- **Brand Assets Generated**:
  - `public/brand/logo-full-transparent.png`: High-res gold line art on transparent background.
  - `public/brand/logo-banner.png`: Horizontal header banner lockup.
  - `public/brand/logo-icon.png`: Square couple icon for favicons and avatars.
  - `public/brand/logo-wordmark.png`: Elegant typography wordmark.
  - `public/brand/logo-print.png`: Maroon artwork on pure white for printouts, invoices, and PDFs.

---

### 2. Matching Engine (`lib/matching-engine.ts`)
- **Hard Filter Gates (Zero Tolerance)**:
  1. Gender: Opposite gender only.
  2. Status: Only `active` profiles participate (`engaged`, `married`, `pending_approval`, `on_hold`, `closed` are automatically excluded).
  3. Religion: Must match (defaults to Islam).
  4. Sect / Maslak: Must match unless either side sets `"Any / No Preference"`.
  5. Caste: Must match unless candidate or partner accepts `"Any"`.
  6. Minimum Education: Candidate must satisfy partner's minimum education qualification.
- **Configurable Hard Filters**: All six filters can be toggled on/off in Admin Settings.
- **Weighted Scoring (0–100 pts)**:
  - Age compatibility within range: 25 pts
  - City / Location fit: 15 pts
  - Height suitability: 10 pts
  - Marital status compatibility: 15 pts
  - Profession & income expectation: 15 pts
  - Family similarity: 5 pts
  - Education bonus: 10 pts
  - Cultural & soft preferences: 5 pts
- **Two-Way Scoring**: Computes directional score $A \rightarrow B$ and $B \rightarrow A$. Final score is the exact arithmetic mean:
  $$\text{Final Match \%} = \frac{\text{Score}_{A \rightarrow B} + \text{Score}_{B \rightarrow A}}{2}$$
- **Tier Boundaries**:
  - Below 50%: Filtered out and never displayed.
  - 50% to 74%: **Compatible Matches** tier (maroon progress ring).
  - 75%+: **Premium Rishtay** tier (antique gold progress ring with star badge).
- **Unit Tested**: Full automated test suite in `tests/matching.test.ts` verifying hard filters, scoring symmetry, and tier cutoffs.

---

### 3. Entry-Time Live Side Panel (`components/profiles/EntrySidePanel.tsx`)
- When staff or coordinators create or edit a rishta (or review an online request), a responsive side panel recalculates top matches in real time (debounced at 350ms).
- Updates live as form fields (gender, age, caste, maslak, education, city, preferences) are typed.
- Displays match count badge, sub-counts for Compatible (50–74%) vs Premium (75%+), compact partner thumbnails, and circular SVG progress rings.

---

### 4. Online Registration & Requests Inbox (`/register` & `/requests`)
- **Public Route (`/register`)**: Bilingual (English & Urdu via query parameter `/register?lang=ur`), mobile-first, and zero login required.
- **Anti-Spam**: Honeypot trap field and rate-limiting safeguard.
- **Duplicate Phone Flag**: Automatically warns staff if the telephone number exists on another profile instead of silently creating duplicate records.
- **Client Thank-You Page**: Provides immediate reference form number (`KMB-XXXX`), one-click **Print Submitted Form**, and **Save to WhatsApp** button.
- **Staff Requests Inbox (`/requests`)**:
  - Submissions arrive with `status = 'pending_approval'`.
  - Excluded from matching engine until verified.
  - Staff can review, edit details, and **Approve** (activates matching engine) or **Reject** with a recorded reason.
  - Sidebar shows real-time badge count of pending requests.

---

### 5. Proposals Pipeline & "Mark as Rishta Done" (`/proposals`)
- Tracks status transitions: `waiting` $\rightarrow$ `interested` $\rightarrow$ `meeting_scheduled` $\rightarrow$ `finalized`.
- Follow-up date reminder and coordinator notes.
- **"Mark as Rishta Done" Action**:
  - Finalizes the proposal.
  - Automatically transitions both profiles to `engaged`.
  - Excludes both profiles from future match searches.
  - Automatically generates a **Success Fee Invoice** (`INV-2026-XXXX`) for the designated family party.

---

### 6. Invoice & Multi-Payment System (`/invoices`)
- Auto-generated sequential numbering: `INV-2026-0001` (year-based, unique).
- Fee Categories: Registration Fee, Premium Membership Fee, Success Fee, Other.
- Multi-Payment Support: Records partial payments with payment method (`Cash`, `Bank Transfer`, `JazzCash`, `Easypaisa`), receipt numbers (`REC-XXXX-1`), received-by staff name, and dates.
- Statuses: `unpaid`, `partial`, `paid`, `cancelled`.
- **Multi-Format Receipt Printing**:
  - **A4 Standard**: Official bureau invoice letterhead.
  - **A5 Slip**: Compact slip for fast client desk collection.
  - **80mm POS Thermal Receipt**: Optimized layout for POS thermal receipt printers.

---

### 7. Print & PDF System (Everywhere)
- Paper Registration Form format mirroring official Pakistani bureau stationery.
- **Privacy Mode Toggle**:
  - *Family Share Copy*: Strips phone numbers, guardian contact, and residential address for safe sharing with the other family.
  - *Internal Office Copy*: Displays complete phone numbers and CNIC for staff audit.
- Side-by-side rishta comparison sheet with two-way score breakdown.

---

## 🧭 Routes Directory

| Route | Type | Description |
|---|---|---|
| `/` | Public | Homepage (Hero, 3-step guide, trust pillars, VIP preview, Lahore contact) |
| `/about` | Public | Bureau history, Begum Kiran Shah's charter, standards, Lahore office |
| `/how-it-works` | Public | Step-by-step matchmaking workflow for families |
| `/success-stories` | Public | Real testimonials from verified Pakistani families |
| `/premium-membership` | Public | VIP concierge membership details and fee breakdown |
| `/contact` | Public | Office hours, Jail Road Gulberg location, telephone, inquiry form |
| `/register` | Public | Online registration link (bilingual, anti-spam, thank-you page) |
| `/login` | Staff | Staff & Admin authentication portal (with one-click demo login) |
| `/dashboard` | Dashboard | KPI cards, maroon & gold revenue charts, follow-ups, pending alerts |
| `/profiles` | Dashboard | Filterable directory, search, CSV export (admin), CSV import |
| `/profiles/new` | Dashboard | Staff registration intake with real-time EntrySidePanel |
| `/profiles/[id]` | Dashboard | Profile detail view, privacy print toggle, proposal log |
| `/profiles/[id]/edit` | Dashboard | Edit profile fields with real-time EntrySidePanel |
| `/profiles/[id]/matches` | Dashboard | Candidate matches page (50-74% and 75%+ tabs, breakdown, WhatsApp) |
| `/premium` | Dashboard | Top-level directory of all 75%+ matches across the bureau |
| `/requests` | Dashboard | Online registration requests inbox with duplicate phone alerts |
| `/proposals` | Dashboard | Proposal pipeline, follow-up dates, Mark Rishta Done modal |
| `/invoices` | Dashboard | Invoices ledger, partial payment recording, A4/A5/thermal receipts |
| `/settings` | Dashboard | Admin panel for fee amounts, hard filter toggles, score weights, staff |

---

## 🛠️ Setup & Local Development

### 1. Requirements
- Node.js 18+ (tested on Node v24)
- npm 9+

### 2. Installation
```bash
# Clone or navigate to the directory
cd e:\kiranmarriagebureau

# Install dependencies
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase credentials (optional for local demo mode as the integrated data layer works out-of-the-box):
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Running Unit Tests
```bash
npm test
```

### 5. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the public website, or [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the staff portal.

### 6. Production Build
```bash
npm run build
npm start
```

---

## 🗄️ Supabase Database Setup

SQL migration files are located in `supabase/migrations/20261106_initial_schema.sql`.

To deploy to Supabase:
1. Create a new project in the [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor**.
3. Paste and run the contents of `supabase/migrations/20261106_initial_schema.sql`.
4. Create a private Storage bucket named `verification-documents` for photos and CNIC copies.

---

## 👥 Staff User Guide

1. **Adding a New Rishta**:
   - Click **+ Add New Rishta** in the sidebar.
   - Enter candidate personal, education, and family details.
   - Watch the **Live Compatibility Engine** panel on the right populate with matches as you type!
   - Click **Save & Enter Matching Engine**.

2. **Processing Online Requests**:
   - Click **Online Requests** in the sidebar (badge counter indicates pending items).
   - Review candidate details. Note any duplicate phone warnings.
   - Click **Approve & Enter Matching Engine** to activate the profile.

3. **Generating Family Share Summaries**:
   - Go to candidate matches page (`/profiles/[id]/matches`).
   - Click **Share Summary** on any match card to generate a clean, privacy-sanitized WhatsApp summary without contact numbers.
   - Click **Compare Side-by-Side** to inspect mutual compatibility and print a comparison sheet.

4. **Marking a Rishta Done**:
   - When families agree to finalize, go to **Proposals Log** (`/proposals`).
   - Click **Mark as Rishta Done**.
   - Select which family is billed for the success fee and confirm.
   - Both profiles are automatically updated to `Engaged`, removed from future matches, and a Success Fee invoice is issued.

5. **Printing Invoices & Thermal Receipts**:
   - Go to **Fee & Invoices** (`/invoices`).
   - Click **Receipt** on any invoice.
   - Toggle between **A4 Standard**, **A5 Slip**, or **80mm Thermal** and click **Print Receipt**.
