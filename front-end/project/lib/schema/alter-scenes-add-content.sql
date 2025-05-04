-- Add content column to scenes table if it doesn't exist
ALTER TABLE scenes ADD COLUMN content TEXT;
