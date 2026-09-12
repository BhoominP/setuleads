-- SetuLeads & JobRadar Postgres Database Schema
-- Combined Lead Generation CRM and Job/Freelance Application Tracker

-- 1. ENUMS FOR LEADS
DO $$ BEGIN
  CREATE TYPE lead_source AS ENUM (
    'google_places',
    'osm',
    'manual',
    'referral',
    'telegram',
    'internshala',
    'inbound_form',
    'other'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TYPE lead_source ADD VALUE IF NOT EXISTS 'osm';

DO $$ BEGIN
  CREATE TYPE lead_stage AS ENUM (
    'new',
    'contacted',
    'replied',
    'negotiating',
    'won',
    'lost'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE activity_type AS ENUM (
    'note',
    'email_sent',
    'call',
    'follow_up',
    'meeting',
    'stage_change'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. ENUMS FOR JOBRADAR APPLICATIONS
DO $$ BEGIN
  CREATE TYPE application_source AS ENUM (
    'arbeitnow',
    'remoteok',
    'jobicy',
    'himalayas',
    'adzuna',
    'manual'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE application_type AS ENUM (
    'full_time',
    'internship',
    'freelance'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE application_stage AS ENUM (
    'saved',
    'applied',
    'interviewing',
    'offer',
    'rejected',
    'withdrawn'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website_url TEXT,
  source lead_source NOT NULL DEFAULT 'manual',
  source_query TEXT,
  location TEXT,
  stage lead_stage NOT NULL DEFAULT 'new',
  estimated_value NUMERIC(10, 2),
  website_notes TEXT,
  general_notes TEXT,
  website_score INTEGER CHECK (website_score IS NULL OR (website_score >= 0 AND website_score <= 100)),
  website_check_details JSONB,
  google_place_id TEXT,
  geoapify_place_id TEXT,
  osm_type TEXT,
  osm_id TEXT,
  overture_id TEXT,
  discovery_area TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_contacted_at TIMESTAMPTZ
);

-- 4. TAGS & LEAD_TAGS
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#8A8578',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lead_tags (
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (lead_id, tag_id)
);

-- 5. ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type activity_type NOT NULL DEFAULT 'note',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. EXPORT LOGS TABLE
CREATE TABLE IF NOT EXISTS export_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exported_by UUID,
  filter_criteria JSONB,
  record_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. JOBRADAR APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  url TEXT NOT NULL,
  location TEXT,
  remote BOOLEAN NOT NULL DEFAULT false,
  type application_type NOT NULL DEFAULT 'full_time',
  source application_source NOT NULL DEFAULT 'manual',
  salary_text TEXT,
  tags TEXT[],
  stage application_stage NOT NULL DEFAULT 'saved',
  notes TEXT,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. AUTOMATIC UPDATED_AT TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated access to leads" ON leads FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated access to tags" ON tags FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated access to lead_tags" ON lead_tags FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated access to activities" ON activities FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated access to export_logs" ON export_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated access to applications" ON applications FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 10. INDEXES
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_google_place_id ON leads(google_place_id);
CREATE INDEX IF NOT EXISTS idx_leads_osm_id ON leads(osm_type, osm_id);
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_applications_stage ON applications(stage);
CREATE INDEX IF NOT EXISTS idx_applications_type ON applications(type);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
