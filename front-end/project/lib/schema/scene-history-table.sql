-- Create scene_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS scene_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scene_id TEXT NOT NULL,
  change_type TEXT NOT NULL, -- e.g., 'created', 'updated', 'deleted'
  change_description TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  changed_by TEXT,
  FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE
);
