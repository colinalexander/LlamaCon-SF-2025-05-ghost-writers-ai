import { createClient } from '@libsql/client';

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL environment variable is not set');
}

if (!process.env.TURSO_AUTH_TOKEN_RO || !process.env.TURSO_AUTH_TOKEN_RW) {
  throw new Error('Turso auth tokens are not set');
}

// Read-only client for queries
export const dbRO = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN_RO
});

// Read-write client for mutations
export const dbRW = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN_RW
});

export async function getProjects() {
  try {
    const result = await dbRO.execute('SELECT * FROM projects ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Failed to fetch projects');
  }
}

export async function createProject(project: any) {
  try {
    const result = await dbRW.execute({
      sql: `INSERT INTO projects (id, title, description, genre, audience, style, story_length)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            RETURNING id`,
      args: [
        crypto.randomUUID(),
        project.title,
        project.description,
        project.genre,
        project.audience,
        project.style,
        project.story_length
      ]
    });
    return result.rows[0].id;
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error('Failed to create project');
  }
}

/**
 * Verifies if a scene exists and belongs to the specified project.
 * @param sceneId The ID of the scene to check.
 * @param projectId The ID of the project.
 * @returns The scene data if found, otherwise null.
 */
export async function verifySceneExists(sceneId: string, projectId: string): Promise<any | null> {
  const sceneCheck = await dbRO.execute({
    sql: 'SELECT * FROM scenes WHERE id = ? AND project_id = ?',
    args: [sceneId, projectId]
  });

  if (sceneCheck.rows.length === 0) {
    return null;
  }
  return sceneCheck.rows[0];
}