-- Initialize database schema

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  codename TEXT,
  role TEXT NOT NULL,
  background TEXT,
  personality_traits TEXT,
  skills TEXT,
  wants TEXT,
  fears TEXT,
  appearance TEXT,
  status TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create index for faster character lookups by project
CREATE INDEX IF NOT EXISTS idx_characters_project_id ON characters(project_id);