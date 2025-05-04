import { dbRW } from './db';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  console.log('Running database migrations...');
  
  try {
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
    
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Execute migration
runMigration();

export { runMigration };
