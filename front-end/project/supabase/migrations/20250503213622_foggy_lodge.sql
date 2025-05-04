/*
  # Create scenes table
  
  1. New Tables
    - `scenes`
      - `id` (text, primary key)
      - `project_id` (text, references projects)
      - `title` (text)
      - `location` (text)
      - `time` (text)
      - `conflict` (text)
      - `characters_present` (text)
      - `character_changes` (text)
      - `important_actions` (text)
      - `mood` (text)
      - `summary` (text)
      - `scene_order` (integer)
      - `created_at` (datetime)
      - `updated_at` (datetime)
*/

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
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create index for faster scene lookups by project
CREATE INDEX IF NOT EXISTS idx_scenes_project_id ON scenes(project_id);

-- Create index for scene ordering
CREATE INDEX IF NOT EXISTS idx_scenes_order ON scenes(project_id, scene_order);