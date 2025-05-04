-- Create scenes table if it doesn't exist
CREATE TABLE IF NOT EXISTS scenes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  time TEXT NOT NULL,
  conflict TEXT NOT NULL,
  characters_present TEXT NOT NULL,
  character_changes TEXT,
  important_actions TEXT NOT NULL,
  mood TEXT NOT NULL,
  summary TEXT NOT NULL,
  scene_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);
