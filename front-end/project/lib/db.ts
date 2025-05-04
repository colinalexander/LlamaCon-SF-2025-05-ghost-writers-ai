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

// Initialize the database with required tables
export async function initializeDatabase() {
  try {
    // Create conversation_transcripts table if it doesn't exist
    await dbRW.execute(`
      CREATE TABLE IF NOT EXISTS conversation_transcripts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT NOT NULL,
        transcript TEXT NOT NULL,
        created_at TEXT NOT NULL,
        project_id TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `);
    
    // Create tavus_videos table if it doesn't exist
    await dbRW.execute(`
      CREATE TABLE IF NOT EXISTS tavus_videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        video_id TEXT NOT NULL,
        status TEXT NOT NULL,
        hosted_url TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        project_id TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id)
      )
    `);
    
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

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
=======
// Tavus video functions
export async function createTavusVideo(videoData: {
  video_id: string;
  status: string;
  hosted_url: string;
  project_id?: string;
}) {
  try {
    const now = new Date().toISOString();
    const result = await dbRW.execute({
      sql: `INSERT INTO tavus_videos (video_id, status, hosted_url, created_at, updated_at, project_id)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING id`,
      args: [
        videoData.video_id,
        videoData.status,
        videoData.hosted_url,
        now,
        now,
        videoData.project_id || null
      ]
    });
    return result.rows[0].id;
  } catch (error) {
    console.error('Error creating Tavus video record:', error);
    throw new Error('Failed to create Tavus video record');
  }
}

export async function updateTavusVideoStatus(video_id: string, status: string) {
  try {
    const now = new Date().toISOString();
    await dbRW.execute({
      sql: `UPDATE tavus_videos 
            SET status = ?, updated_at = ?
            WHERE video_id = ?`,
      args: [status, now, video_id]
    });
    return true;
  } catch (error) {
    console.error('Error updating Tavus video status:', error);
    throw new Error('Failed to update Tavus video status');
  }
}

export async function getTavusVideoStatus(video_id: string) {
  try {
    const result = await dbRO.execute({
      sql: `SELECT * FROM tavus_videos WHERE video_id = ?`,
      args: [video_id]
    });
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching Tavus video status:', error);
    throw new Error('Failed to fetch Tavus video status');
  }
}
