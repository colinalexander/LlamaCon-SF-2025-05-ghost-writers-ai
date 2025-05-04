import { dbRW } from './db';
import fs from 'fs';
import path from 'path';

const DB_VERSION_KEY = 'db_version';

async function runMigration() {
  console.log('Running database migrations...');
  
  try {
    // Check current DB version
    let currentVersion = 0;
    const versionResult = await dbRW.execute({
      sql: `SELECT value FROM app_settings WHERE key = ?`,
      args: [DB_VERSION_KEY]
    });
    
    if (versionResult.rows.length > 0 && versionResult.rows[0].value) {
      // Parse the version string to number
      currentVersion = parseInt(versionResult.rows[0].value as string);
    } else {
      // Create app_settings table if it doesn't exist
      await dbRW.execute(`
        CREATE TABLE IF NOT EXISTS app_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `);
      
      // Initialize version
      await dbRW.execute({
        sql: `INSERT INTO app_settings (key, value) VALUES (?, ?)`,
        args: [DB_VERSION_KEY, '0']
      });
    }
    
    console.log(`Current database version: ${currentVersion}`);
    
    // Create base tables
    // Create scenes table
    const scenesTableSQL = fs.readFileSync(
      path.join(process.cwd(), 'lib', 'schema', 'scenes-table.sql'),
      'utf8'
    );
    
    await dbRW.execute(scenesTableSQL);
    console.log('Scenes table created or verified.');
    
    // Create scene_history table
    const sceneHistoryTableSQL = fs.readFileSync(
      path.join(process.cwd(), 'lib', 'schema', 'scene-history-table.sql'),
      'utf8'
    );
    
    await dbRW.execute(sceneHistoryTableSQL);
    console.log('Scene history table created or verified.');
    
    // Create scene_memory table
    try {
      const sceneMemoryTableSQL = fs.readFileSync(
        path.join(process.cwd(), 'lib', 'schema', 'scene-memory-table.sql'),
        'utf8'
      );
      
      await dbRW.execute(sceneMemoryTableSQL);
      console.log('Scene memory table created or verified.');
    } catch (e) {
      console.error('Error creating scene memory table:', e);
    }
    
    // Apply migrations based on version
    if (currentVersion < 4) {
      // Migration 4: Add content column to scenes table
      try {
        const alterScenesSQL = fs.readFileSync(
          path.join(process.cwd(), 'lib', 'schema', 'alter-scenes-add-content.sql'),
          'utf8'
        );
        
        await dbRW.execute(alterScenesSQL);
        console.log('Migration 4: Added content column to scenes table');
        
        // Update version
        await dbRW.execute({
          sql: `UPDATE app_settings SET value = ? WHERE key = ?`,
          args: ['4', DB_VERSION_KEY]
        });
        
        currentVersion = 4;
      } catch (e) {
        // If it fails because column already exists, that's okay
        console.log('Note: Content column might already exist');
      }
    }
    
    console.log('Database migrations completed');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Execute migration
runMigration();

export { runMigration };
