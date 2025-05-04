/*
  # Create scene history table
  
  1. New Tables
    - `scene_history`
      - `id` (text, primary key)
      - `scene_id` (text, references scenes)
      - `project_id` (text, references projects)
      - `content` (text)
      - `created_at` (datetime)
  
  2. Indexes
    - Index on scene_id and project_id for faster lookups
*/

CREATE TABLE IF NOT EXISTS scene_history (
  id TEXT PRIMARY KEY,
  scene_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_scene_history_lookup 
ON scene_history(scene_id, project_id);