CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  ip TEXT
);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
