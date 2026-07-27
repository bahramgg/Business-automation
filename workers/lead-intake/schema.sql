-- D1 schema for lead capture (plan §12).
CREATE TABLE IF NOT EXISTS leads (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  sector     TEXT NOT NULL,
  link       TEXT,
  created_at TEXT NOT NULL,
  source_ip  TEXT
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at);
-- Spotting duplicate submissions from the same number.
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads (phone);
