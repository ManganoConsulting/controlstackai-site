-- D1 schema for contact leads
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  createdAt TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_leads_createdAt ON leads(createdAt);
