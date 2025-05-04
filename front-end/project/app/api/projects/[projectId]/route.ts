import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, dbRO } from '@/server/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId;
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    console.log('Projects API: Fetching project with ID:', projectId);
    
    try {
      // Initialize the database
      await initializeDatabase();
      
      // Query the project
      const result = await dbRO.execute({
        sql: `
        SELECT id, title, description, genre, audience, style, story_length as storyLength
        FROM projects
        WHERE id = ?
        `,
        args: [projectId]
      });
      
      if (result.rows.length === 0) {
        console.log('Projects API: Project not found with ID:', projectId);
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      
      const project = result.rows[0];
      console.log('Projects API: Found project:', project);
      
      return NextResponse.json(project);
    } catch (dbError) {
      console.error('Projects API: Database error:', dbError);
      
      // Return a minimal project object with just the ID to allow the UI to function
      return NextResponse.json(
        { id: projectId, title: 'Project', description: 'Details unavailable' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Projects API: Error fetching project:', error);
    
    // Return a minimal project object with just the ID to allow the UI to function
    return NextResponse.json(
      { id: params.projectId, title: 'Project', description: 'Details unavailable' },
      { status: 200 }
    );
  }
}
