CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS objectives (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL,
  progress INTEGER NOT NULL,
  target_date TIMESTAMPTZ,
  owner_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS research_items (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  objective_id TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT NOT NULL,
  sources JSONB NOT NULL,
  findings JSONB NOT NULL,
  tags JSONB NOT NULL,
  attachments JSONB NOT NULL,
  owner_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  objective_id TEXT,
  research_item_ids JSONB NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  mission TEXT NOT NULL,
  vision TEXT NOT NULL,
  positioning TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  brand_voice TEXT NOT NULL,
  personality JSONB NOT NULL,
  core_values JSONB NOT NULL,
  color_palette JSONB NOT NULL,
  typography JSONB NOT NULL,
  status TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  objective_id TEXT,
  brand_id TEXT,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL,
  version INTEGER NOT NULL,
  tags JSONB NOT NULL,
  owner_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  objective_id TEXT,
  package_name TEXT NOT NULL,
  package_type TEXT NOT NULL,
  included_documents JSONB NOT NULL,
  included_pdfs JSONB NOT NULL,
  included_assets JSONB NOT NULL,
  status TEXT NOT NULL,
  download_url TEXT,
  owner_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS hospitality_blueprints (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  objective_id TEXT,
  research_item_ids JSONB NOT NULL,
  brand_ids JSONB NOT NULL,
  document_ids JSONB NOT NULL,
  pdf_template_ids JSONB NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  blueprint_type TEXT NOT NULL,
  features JSONB NOT NULL,
  concept_notes TEXT NOT NULL,
  menu_engineering TEXT NOT NULL,
  food_cost_target DOUBLE PRECISION,
  labor_cost_target DOUBLE PRECISION,
  revenue_strategy TEXT NOT NULL,
  operations_framework TEXT NOT NULL,
  status TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  amount INTEGER NOT NULL,
  billing_cycle TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_customer_id_idx ON subscriptions (customer_id);
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_idx ON subscriptions (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_idx ON subscriptions (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
