import { dbRO, dbRW } from './db';
import { Scene, SceneInput } from './types';

// Note: ensureScenesTable logic from the original route might need to be called 
// appropriately, perhaps during application initialization or before the first scene operation.

export async function getScenes(projectId: string): Promise<Scene[]> {
  // Select specific columns known to exist based on original schema
  const sql = `SELECT id, project_id, title, location, time, conflict, 
                     characters_present, character_changes, important_actions, 
                     mood, summary, scene_order, created_at, updated_at 
               FROM scenes WHERE project_id = ? ORDER BY scene_order ASC`;
  const result = await dbRO.execute({
    sql: sql,
    args: [projectId]
  });
  return result.rows as unknown as Scene[];
}

export async function createScene(projectId: string, sceneData: SceneInput): Promise<string> {
  // Get the next scene order
  const orderResult = await dbRO.execute({
    sql: 'SELECT COALESCE(MAX(scene_order), 0) as max_order FROM scenes WHERE project_id = ?',
    args: [projectId]
  });
  const maxOrder = orderResult.rows[0]?.max_order;
  const nextOrder = typeof maxOrder === 'number' ? maxOrder + 1 : 1;

  const newId = crypto.randomUUID();
  const result = await dbRW.execute({
    sql: `INSERT INTO scenes (
      id,
      project_id,
      title,
      location,
      time,
      conflict,
      characters_present,
      character_changes,
      important_actions,
      mood,
      summary,
      scene_order,
      created_at,
      updated_at,
      content
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
    RETURNING id`,
    args: [
      projectId,
      newId,
      sceneData.title,
      sceneData.location ?? null, // Default to null
      sceneData.time ?? null, // Default to null
      sceneData.conflict ?? null, // Default to null
      sceneData.charactersPresent ?? null, // Default to null
      sceneData.characterChanges ?? null,
      sceneData.importantActions ?? null, // Default to null
      sceneData.mood ?? null, // Default to null
      sceneData.summary ?? null, // Default to null
      nextOrder,
      sceneData.content ?? '', // Default to empty string
    ]
  });
  return result.rows[0].id as unknown as string;
}

export async function getSceneById(sceneId: string): Promise<Scene | null> {
  // Select specific columns known to exist based on original schema
  const sql = `SELECT id, project_id, title, location, time, conflict, 
                     characters_present, character_changes, important_actions, 
                     mood, summary, scene_order, created_at, updated_at 
               FROM scenes WHERE id = ?`;
  const result = await dbRO.execute({
    sql: sql,
    args: [sceneId]
  });
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0] as unknown as Scene;
}

export async function updateScene(sceneId: string, projectId: string, sceneData: SceneInput): Promise<string | null> {
  const result = await dbRW.execute({
    sql: `UPDATE scenes SET
      title = ?,
      location = ?,
      time = ?,
      conflict = ?,
      characters_present = ?,
      character_changes = ?,
      important_actions = ?,
      mood = ?,
      summary = ?,
      content = ?, 
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND project_id = ?
      RETURNING id`,
    args: [
      sceneData.title,
      sceneData.location ?? null, // Default to null
      sceneData.time ?? null, // Default to null
      sceneData.conflict ?? null, // Default to null
      sceneData.charactersPresent ?? null, // Default to null
      sceneData.characterChanges ?? null, // Use SceneInput field, default to null
      sceneData.importantActions ?? null, // Default to null
      sceneData.mood ?? null, // Default to null
      sceneData.summary ?? null, // Default to null
      sceneData.content ?? '', // Add content argument, default to empty string if not provided
      sceneId,
      projectId
    ]
  });

  if (result.rows.length === 0) {
    return null; // Indicate not found
  }
  return result.rows[0].id as unknown as string;
}

export async function deleteScene(sceneId: string, projectId: string): Promise<boolean> {
  const result = await dbRW.execute({
    sql: 'DELETE FROM scenes WHERE id = ? AND project_id = ? RETURNING id',
    args: [sceneId, projectId]
  });
  return result.rows.length > 0; // Return true if a row was deleted
}
