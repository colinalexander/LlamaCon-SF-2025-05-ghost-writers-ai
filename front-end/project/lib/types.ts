export interface Character {
  id: string;
  project_id: string;
  name: string;
  codename?: string | null;
  role: string;
  background: string;
  personality_traits: string; // Consider if this should be structured (e.g., string[])
  skills: string; // Consider if this should be structured
  wants: string; // Consider if this should be structured
  fears: string; // Consider if this should be structured
  appearance: string;
  status: string;
  notes?: string | null;
  created_at: string; // Or Date
  updated_at: string; // Or Date
}

// Input type for creating/updating might omit id, project_id, created_at, updated_at
export type CharacterInput = Omit<Character, 'id' | 'project_id' | 'created_at' | 'updated_at'>;

export interface Scene {
  id: string;
  project_id: string;
  title: string;
  location: string;
  time: string;
  conflict: string;
  characters_present: string; // Consider string[] or relation
  character_changes?: string | null; // Consider structured type
  important_actions: string;
  mood: string;
  summary: string;
  scene_order: number;
  created_at: string; // Or Date
  updated_at: string; // Or Date
  content?: string | null; // Added based on schema exploration
}

// Input type for creating/updating scenes
export type SceneInput = Omit<Scene, 'id' | 'project_id' | 'scene_order' | 'created_at' | 'updated_at' | 'content'> & {
  // Explicitly include fields expected from client, map to DB columns in DAL
  charactersPresent: string; // Required based on DB schema NOT NULL
  characterChanges?: string | null; // Optional based on original DB insert
  importantActions: string; // Required based on DB schema NOT NULL
};
