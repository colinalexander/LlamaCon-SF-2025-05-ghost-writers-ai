/*
  # Create shared characters table
  
  1. New Tables
    - `shared_characters`
      - Same structure as characters table
      - Available for all users to import
  
  2. Initial Data
    - Add some example shared characters
*/

CREATE TABLE IF NOT EXISTS shared_characters (
  id TEXT PRIMARY KEY,
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
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert some example shared characters
INSERT INTO shared_characters (
  id, name, role, background, personality_traits, skills, wants, fears, appearance, status
) VALUES 
(
  'mentor-archetype',
  'The Wise Mentor',
  'mentor',
  'A seasoned expert who has seen it all and lived to tell the tale.',
  'Patient, Wise, Mysterious, Sometimes Cryptic',
  'Deep knowledge, Teaching ability, Survival skills',
  'To pass on knowledge, To protect their student',
  'Failing their student, History repeating itself',
  'Distinguished appearance, Often has a signature accessory or mark of expertise',
  'Ready to guide the protagonist'
),
(
  'rival-archetype',
  'The Worthy Rival',
  'rival',
  'Someone who parallels the protagonist but took a different path.',
  'Competitive, Skilled, Driven, Complex',
  'Equal to protagonist''s abilities, Often excels where protagonist struggles',
  'To prove their way is better, To win at any cost',
  'Being second-best, Losing what matters most',
  'Similar to protagonist but with a darker or opposite aesthetic',
  'Actively challenging the protagonist'
);