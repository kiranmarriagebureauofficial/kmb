-- Kiran Marriage Bureau Management System - Supabase Migration
-- Brand: Deep Maroon (#5A0A14), Antique Gold (#D9A93F), Ivory (#FBF4E6)
-- Schema creation with RLS and Indexes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_no VARCHAR(30) UNIQUE NOT NULL,
    date_applied DATE DEFAULT CURRENT_DATE,
    applied_by VARCHAR(100) NOT NULL,
    
    -- Personal Details
    name VARCHAR(150) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
    age INTEGER NOT NULL CHECK (age >= 18),
    date_of_birth DATE,
    marital_status VARCHAR(30) NOT NULL,
    second_marriage_details JSONB,
    height VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    society_name VARCHAR(150),
    
    -- Education & Profession
    degree VARCHAR(200) NOT NULL,
    education_level VARCHAR(50) NOT NULL,
    profession VARCHAR(150) NOT NULL,
    designation VARCHAR(150),
    experience_years INTEGER DEFAULT 0,
    business_name_address TEXT,
    monthly_income NUMERIC(12, 2) DEFAULT 0,
    
    -- Family Details
    father_name VARCHAR(150) NOT NULL,
    father_occupation VARCHAR(150),
    mother_name VARCHAR(150) NOT NULL,
    mother_occupation VARCHAR(150),
    total_siblings INTEGER DEFAULT 0,
    brothers_count INTEGER DEFAULT 0,
    sisters_count INTEGER DEFAULT 0,
    married_siblings_count INTEGER DEFAULT 0,
    religion VARCHAR(50) DEFAULT 'Islam',
    caste VARCHAR(100) NOT NULL,
    maslak VARCHAR(100) NOT NULL,
    
    -- Contact & Private Details (Staff/Admin only)
    phone VARCHAR(30) NOT NULL,
    whatsapp VARCHAR(30),
    guardian_name VARCHAR(150),
    guardian_phone VARCHAR(30),
    address TEXT NOT NULL,
    cnic VARCHAR(30),
    photo_url TEXT,
    
    -- Partner Preferences
    preferences JSONB NOT NULL,
    
    -- Status & Membership
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'pending_approval', 'on_hold', 'engaged', 'married', 'closed', 'rejected')),
    rejection_reason TEXT,
    premium_member BOOLEAN DEFAULT FALSE,
    premium_start_date DATE,
    premium_end_date DATE,
    
    -- Internal notes
    remarks TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes for matching engine filters
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_religion ON public.profiles(religion);
CREATE INDEX IF NOT EXISTS idx_profiles_caste ON public.profiles(caste);
CREATE INDEX IF NOT EXISTS idx_profiles_maslak ON public.profiles(maslak);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_education ON public.profiles(education_level);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- 2. MATCHES TABLE (Cached computed matches)
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_a UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    profile_b UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    score_ab NUMERIC(5, 2) NOT NULL,
    score_ba NUMERIC(5, 2) NOT NULL,
    final_score NUMERIC(5, 2) NOT NULL,
    tier VARCHAR(20) CHECK (tier IN ('matches', 'premium')),
    breakdown JSONB NOT NULL,
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_a, profile_b)
);

CREATE INDEX IF NOT EXISTS idx_matches_final_score ON public.matches(final_score);
CREATE INDEX IF NOT EXISTS idx_matches_tier ON public.matches(tier);

-- 3. PROPOSALS TABLE
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    profile_a UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    profile_b UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    sent_date DATE DEFAULT CURRENT_DATE,
    sent_by VARCHAR(100) NOT NULL,
    status VARCHAR(40) DEFAULT 'waiting' CHECK (status IN ('waiting', 'interested', 'not_interested', 'meeting_scheduled', 'finalized')),
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE RESTRICT,
    proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
    invoice_type VARCHAR(30) CHECK (invoice_type IN ('registration', 'premium', 'success', 'other')),
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'cancelled')),
    date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INVOICE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL
);

-- 6. INVOICE PAYMENTS TABLE (Partial / multi-payments)
CREATE TABLE IF NOT EXISTS public.invoice_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_method VARCHAR(40) CHECK (payment_method IN ('Cash', 'Bank Transfer', 'JazzCash', 'Easypaisa')),
    received_by VARCHAR(100) NOT NULL,
    receipt_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. STAFF TABLE
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'staff')),
    phone VARCHAR(30),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'global_settings',
    bureau_name VARCHAR(150) DEFAULT 'Kiran Marriage Bureau',
    address TEXT,
    phones TEXT[],
    whatsapp VARCHAR(30),
    email VARCHAR(150),
    fee_defaults JSONB NOT NULL,
    matching_config JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    actor_name VARCHAR(150) NOT NULL,
    actor_role VARCHAR(20) NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details TEXT NOT NULL
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Staff & Admin read/write policies
CREATE POLICY "Staff can view all profiles" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can insert profiles" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Staff can update profiles" ON public.profiles
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admin only can delete profiles" ON public.profiles
    FOR DELETE TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE staff.email = auth.email() AND staff.role = 'admin'
        )
    );

-- Public Registration policy (allows public to submit with status = 'pending_approval' only)
CREATE POLICY "Public online registration submission" ON public.profiles
    FOR INSERT TO anon WITH CHECK (status = 'pending_approval');
