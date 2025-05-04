import { dbRO, dbRW } from './db';
import { Character, CharacterInput } from './types';

export async function getCharacters(projectId: string): Promise<Character[]> {
  const result = await dbRO.execute({
    sql: 'SELECT * FROM characters WHERE project_id = ? ORDER BY created_at DESC',
    args: [projectId]
  });
  return result.rows as unknown as Character[];
}

export async function getCharacterById(id: string): Promise<Character | null> {
  const result = await dbRO.execute({
    sql: 'SELECT * FROM characters WHERE id = ?',
    args: [id]
  });
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0] as unknown as Character;
}

export async function createCharacter(projectId: string, characterData: CharacterInput): Promise<string> {
  const newId = crypto.randomUUID();
  const result = await dbRW.execute({
    sql: `INSERT INTO characters (
      id,
      project_id,
      name,
      codename_or_alias,
      role,
      background,
      personality_traits,
      skills,
      wants,
      fears,
      appearance,
      status,
      notes,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING id`,
    args: [
      newId,
      projectId,
      characterData.name,
      characterData.codename || null,
      characterData.role,
      characterData.background,
      characterData.personality_traits,
      characterData.skills,
      characterData.wants,
      characterData.fears,
      characterData.appearance,
      characterData.status,
      characterData.notes || null
    ]
  });
  return result.rows[0].id as unknown as string;
}

export async function updateCharacter(id: string, projectId: string, characterData: CharacterInput): Promise<boolean> {
  const result = await dbRW.execute({
    sql: `UPDATE characters SET
      name = ?,
      codename_or_alias = ?,
      role = ?,
      background = ?,
      personality_traits = ?,
      skills = ?,
      wants = ?,
      fears = ?,
      appearance = ?,
      status = ?,
      notes = ?,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND project_id = ?
      RETURNING id`,
    args: [
      characterData.name,
      characterData.codename || null,
      characterData.role,
      characterData.background,
      characterData.personality_traits,
      characterData.skills,
      characterData.wants,
      characterData.fears,
      characterData.appearance,
      characterData.status,
      characterData.notes || null,
      id,
      projectId
    ]
  });
  return result.rows.length > 0;
}

export async function deleteCharacter(id: string, projectId: string): Promise<boolean> {
  const result = await dbRW.execute({
    sql: 'DELETE FROM characters WHERE id = ? AND project_id = ? RETURNING id',
    args: [id, projectId]
  });
  return result.rows.length > 0;
}
