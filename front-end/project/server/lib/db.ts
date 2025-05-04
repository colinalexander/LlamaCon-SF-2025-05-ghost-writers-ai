import { createClient } from '@libsql/client';

// Function to generate a simple ID string that is compatible with Turso
function generateId() {
  // Generate a timestamp-based ID with a random suffix
  const timestamp = Date.now().toString(36);
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomSuffix}`;
}

// In-memory mock database for development
const mockProjects: any[] = [];
const mockUsers: any[] = [];

// Check if we're using the real database or mock
const useRealDb = process.env.TURSO_DATABASE_URL && 
                  process.env.TURSO_AUTH_TOKEN_RO && 
                  process.env.TURSO_AUTH_TOKEN_RW;

// Create clients or mock implementations
let dbRO: any;
let dbRW: any;

if (useRealDb) {
  console.log('Using real Turso database');
  // Read-only client for queries
  dbRO = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN_RO!
  });

  // Read-write client for mutations
  dbRW = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN_RW!
  });
} else {
  console.log('Using in-memory mock database (Turso environment variables not set)');
  
  // Mock implementations
  dbRO = {
    execute: async (params: any) => {
      const sql = typeof params === 'string' ? params : params.sql;
      const args = params.args || [];
      
      console.log('Mock dbRO execute:', sql);
      
      if (sql.includes('SELECT * FROM projects')) {
        return { rows: mockProjects };
      }
      
      if (sql.includes('SELECT * FROM users WHERE email =')) {
        const email = args[0];
        const user = mockUsers.find(u => u.email === email);
        return { rows: user ? [user] : [] };
      }
      
      return { rows: [] };
    }
  };
  
  dbRW = {
    execute: async (params: any) => {
      console.log('Mock dbRW execute:', params.sql);
      
      if (params.sql.includes('INSERT INTO projects')) {
        const projectId = params.args[0];
        const project = {
          id: projectId,
          title: params.args[1],
          description: params.args[2],
          genre: params.args[3],
          audience: params.args[4],
          style: params.args[5],
          story_length: params.args[6],
          user_id: params.args[7],
          created_at: new Date().toISOString()
        };
        mockProjects.push(project);
        return { rows: [{ id: projectId }] };
      }
      
      if (params.sql.includes('INSERT INTO users')) {
        const userId = params.args[0];
        const user = {
          id: userId,
          username: params.args[1],
          email: params.args[2],
          password_hash: params.args[3] || null,
          salt: params.args[4] || null,
          created_at: new Date().toISOString()
        };
        mockUsers.push(user);
        return { rows: [{ id: userId }] };
      }
      
      return { rows: [] };
    }
  };
}

// Check database version and run migrations
async function checkDatabaseVersion() {
  try {
    // Check if version table exists
    const tableExists = await dbRO.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='db_version'
    `);
    
    if (tableExists.rows.length === 0) {
      // Create version table
      await dbRW.execute(`
        CREATE TABLE db_version (
          version INTEGER PRIMARY KEY,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Set initial version
      await dbRW.execute(`
        INSERT INTO db_version (version) VALUES (1)
      `);
      
      return 1;
    } else {
      // Get current version
      const versionResult = await dbRO.execute(`
        SELECT MAX(version) as current_version FROM db_version
      `);
      
      return versionResult.rows[0].current_version;
    }
  } catch (error) {
    console.error('Error checking database version:', error);
    return 0;
  }
}

// Run database migrations
async function migrateDatabase() {
  if (!useRealDb) {
    return;
  }
  
  try {
    console.log('Running database migrations...');
    
    // Get current version
    const currentVersion = await checkDatabaseVersion();
    console.log('Current database version:', currentVersion);
    
    // Migration 1: Add user_id column to projects table if it doesn't exist
    if (currentVersion < 2) {
      console.log('Running migration to version 2...');
      
      // Check if user_id column exists in projects table
      const tableInfo = await dbRO.execute("PRAGMA table_info(projects)");
      const hasUserIdColumn = tableInfo.rows.some((row: any) => row.name === 'user_id');
      
      if (!hasUserIdColumn) {
        console.log('Adding user_id column to projects table...');
        await dbRW.execute(`ALTER TABLE projects ADD COLUMN user_id TEXT REFERENCES users(id)`);
      }
      
      // Update version
      await dbRW.execute(`INSERT INTO db_version (version) VALUES (2)`);
      console.log('Migration to version 2 completed');
    }
    
    // Migration 2: Add password_hash and salt columns to users table if they don't exist
    if (currentVersion < 3) {
      console.log('Running migration to version 3...');
      
      // Check if password_hash and salt columns exist in users table
      const tableInfo = await dbRO.execute("PRAGMA table_info(users)");
      const hasPasswordHashColumn = tableInfo.rows.some((row: any) => row.name === 'password_hash');
      const hasSaltColumn = tableInfo.rows.some((row: any) => row.name === 'salt');
      
      if (!hasPasswordHashColumn) {
        console.log('Adding password_hash column to users table...');
        await dbRW.execute(`ALTER TABLE users ADD COLUMN password_hash TEXT`);
      }
      
      if (!hasSaltColumn) {
        console.log('Adding salt column to users table...');
        await dbRW.execute(`ALTER TABLE users ADD COLUMN salt TEXT`);
      }
      
      // Update version
      await dbRW.execute(`INSERT INTO db_version (version) VALUES (3)`);
      console.log('Migration to version 3 completed');
    }
    
    // Migration 3: Add firstName and lastName columns to users table if they don't exist
    if (currentVersion < 4) {
      console.log('Running migration to version 4...');
      
      // Check if firstName and lastName columns exist in users table
      const tableInfo = await dbRO.execute("PRAGMA table_info(users)");
      const hasFirstNameColumn = tableInfo.rows.some((row: any) => row.name === 'firstName');
      const hasLastNameColumn = tableInfo.rows.some((row: any) => row.name === 'lastName');
      
      if (!hasFirstNameColumn) {
        console.log('Adding firstName column to users table...');
        await dbRW.execute(`ALTER TABLE users ADD COLUMN firstName TEXT`);
      }
      
      if (!hasLastNameColumn) {
        console.log('Adding lastName column to users table...');
        await dbRW.execute(`ALTER TABLE users ADD COLUMN lastName TEXT`);
      }
      
      // Update version
      await dbRW.execute(`INSERT INTO db_version (version) VALUES (4)`);
      console.log('Migration to version 4 completed');
    }
    
    console.log('Database migrations completed');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

// Track if initialization has been completed
let databaseInitialized = false;

// Initialize the database with required tables
export async function initializeDatabase() {
  if (!useRealDb) {
    console.log('Using mock database, no initialization needed');
    return;
  }
  
  // Skip initialization if already done
  if (databaseInitialized) {
    return;
  }
  
  try {
    console.log('Initializing database tables...');
    
    // Create users table
    await dbRW.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT,
        salt TEXT,
        firstName TEXT,
        lastName TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create projects table with user_id foreign key
    await dbRW.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        genre TEXT,
        audience TEXT,
        style TEXT,
        story_length TEXT,
        user_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // Create scenes table if it doesn't exist
    await dbRW.execute(`
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);
    
    // Create scene_history table if it doesn't exist
    await dbRW.execute(`
      CREATE TABLE IF NOT EXISTS scene_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scene_id TEXT NOT NULL,
        change_type TEXT NOT NULL,
        change_description TEXT,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        changed_by TEXT,
        FOREIGN KEY (scene_id) REFERENCES scenes(id) ON DELETE CASCADE
=======
    // Create tavus_videos table for storing video status
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
    
    // Create conversation_transcripts table for storing Tavus conversation transcripts
    await dbRW.execute(`
      CREATE TABLE IF NOT EXISTS conversation_transcripts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id TEXT NOT NULL UNIQUE,
        transcript TEXT NOT NULL,
        created_at TEXT NOT NULL,
        project_id TEXT,
        FOREIGN KEY (project_id) REFERENCES projects(id)

      )
    `);
    
    console.log('Database tables initialized successfully');
    
    // Run migrations after initializing tables
    await migrateDatabase();
    
    // Mark initialization as complete
    databaseInitialized = true;
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export async function getProjects() {
  try {
    // Initialize database before querying
    await initializeDatabase();
    
    const result = await dbRO.execute('SELECT * FROM projects ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Failed to fetch projects');
  }
}

export async function createProject(project: any) {
  try {
    // Initialize database before creating a project
    await initializeDatabase();
    
    // Generate a simple ID
    const projectId = generateId();
    
    // Ensure all values are strings to avoid type issues
    const title = String(project.title || '');
    const description = String(project.description || '');
    const genre = String(project.genre || '');
    const audience = String(project.audience || '');
    const style = String(project.style || '');
    const story_length = String(project.story_length || '');
    const user_id = String(project.user_id || '');
    
    // Log the values for debugging
    console.log('Creating project with values:', {
      id: projectId,
      title,
      description,
      genre,
      audience,
      style,
      story_length,
      user_id
    });
    
    // Create the project with explicit string values
    const result = await dbRW.execute({
      sql: `INSERT INTO projects (id, title, description, genre, audience, style, story_length, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING id`,
      args: [
        projectId,
        title,
        description,
        genre,
        audience,
        style,
        story_length,
        user_id || null
      ]
    });
    
    return result.rows[0].id;
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error('Failed to create project');
  }
}

export async function createUser(user: { username: string; email: string; password?: string; firstName?: string; lastName?: string }) {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Generate a simple ID
    const userId = generateId();
    
    // Ensure values are strings
    const username = String(user.username || '');
    const email = String(user.email || '');
    
    // If password is provided, hash it
    let passwordHash = null;
    let salt = null;
    
    if (user.password) {
      try {
        // Use local server-side auth utils instead of client-side
        const { generateSalt, hashPassword } = await import('./auth-utils');
        console.log('Server auth utils imported successfully');
        
        salt = generateSalt();
        console.log('Salt generated:', salt);
        
        passwordHash = hashPassword(user.password, salt);
        console.log('Password hashed successfully');
      } catch (hashError) {
        console.error('Error hashing password:', hashError);
        if (hashError instanceof Error) {
          console.error('Hash error message:', hashError.message);
          console.error('Hash error stack:', hashError.stack);
        }
        throw new Error(`Password hashing failed: ${hashError instanceof Error ? hashError.message : String(hashError)}`);
      }
    }
    
    console.log('Creating user with values:', {
      id: userId,
      username,
      email,
      hasPassword: !!passwordHash
    });
    
    // Ensure firstName and lastName are strings
    const firstName = String(user.firstName || '');
    const lastName = String(user.lastName || '');
    
    // Create the user
    const result = await dbRW.execute({
      sql: `INSERT INTO users (id, username, email, password_hash, salt, firstName, lastName)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            RETURNING id`,
      args: [userId, username, email, passwordHash, salt, firstName, lastName]
    });
    
    return result.rows[0].id;
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error; // Rethrow the original error to preserve the stack trace
  }
}

export async function getUserByEmail(email: string) {
  try {
    // Initialize database
    await initializeDatabase();
    
    const result = await dbRO.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email]
    });
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user');
  }
}

export async function getProjectsByUserId(userId: string) {
  try {
    // Initialize database and run migrations
    await initializeDatabase();
    
    try {
      // Try to query with user_id
      const result = await dbRO.execute({
        sql: 'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC',
        args: [userId]
      });
      
      return result.rows;
    } catch (error) {
      // If there's an error with the user_id column, fall back to all projects
      console.error('Error querying with user_id, falling back to all projects:', error);
      
      // Get all projects as fallback
      const allProjects = await getProjects();
      return allProjects;
    }
  } catch (error) {
    console.error('Error fetching user projects:', error);
    throw new Error('Failed to fetch user projects');
  }
}

export async function authenticateUser(email: string, password: string) {
  try {
    // Get user by email
    const user = await getUserByEmail(email);
    
    if (!user) {
      return null; // User not found
    }
    
    // If user exists but has no password (legacy user), return the user
    if (!user.password_hash || !user.salt) {
      return user;
    }
    
    // Verify password
    const { verifyPassword } = await import('./auth-utils');
    const isValid = verifyPassword(password, user.salt, user.password_hash);
    
    if (!isValid) {
      return null; // Invalid password
    }
    
    // Return user without sensitive data
    const { password_hash, salt, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw new Error('Authentication failed');
  }
}

// Tavus video functions
export async function createTavusVideo(videoData: {
  video_id: string;
  status: string;
  hosted_url: string;
  project_id?: string;
}) {
  try {
    // Initialize database before creating a video record
    await initializeDatabase();
    
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
    
    console.log('Tavus video record created:', videoData.video_id);
    return result.rows[0].id;
  } catch (error) {
    console.error('Error creating Tavus video record:', error);
    throw new Error('Failed to create Tavus video record');
  }
}

export async function updateTavusVideoStatus(video_id: string, status: string) {
  try {
    // Initialize database before updating
    await initializeDatabase();
    
    const now = new Date().toISOString();
    await dbRW.execute({
      sql: `UPDATE tavus_videos 
            SET status = ?, updated_at = ?
            WHERE video_id = ?`,
      args: [status, now, video_id]
    });
    
    console.log('Tavus video status updated:', video_id, status);
    return true;
  } catch (error) {
    console.error('Error updating Tavus video status:', error);
    throw new Error('Failed to update Tavus video status');
  }
}

export async function getTavusVideoStatus(video_id: string) {
  try {
    // Initialize database before querying
    await initializeDatabase();
    
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
