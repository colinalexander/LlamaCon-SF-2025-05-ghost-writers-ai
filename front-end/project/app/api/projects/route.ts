import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    console.log('Projects API: GET request with userId:', userId);
    
    if (userId) {
      // Get projects for a specific user
      const { getProjectsByUserId } = await import('@/server/lib/db');
      console.log('Projects API: Fetching projects for user:', userId);
      const projects = await getProjectsByUserId(userId);
      console.log('Projects API: Found', projects.length, 'projects for user');
      return NextResponse.json(projects);
    } else {
      // Get all projects (fallback)
      console.log('Projects API: No userId provided, fetching all projects');
      const { getProjects } = await import('@/server/lib/db');
      const projects = await getProjects();
      console.log('Projects API: Found', projects.length, 'projects total');
      return NextResponse.json(projects);
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Projects API: Creating project with data:', {
      ...data,
      user_id: data.user_id || 'not provided'
    });
    
    if (!data.user_id) {
      console.error('Projects API: No user_id provided for project creation');
      return NextResponse.json(
        { error: 'User ID is required to create a project' },
        { status: 400 }
      );
    }
    
    const { createProject } = await import('@/server/lib/db');
    const projectId = await createProject(data);
    console.log('Projects API: Project created with ID:', projectId);
    
    // Create a response with the project ID
    const response = NextResponse.json({ id: projectId });
    
    // Set the cookie in the response
    response.cookies.set('currentProjectId', projectId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false, // Allow JavaScript access
    });
    
    console.log('Projects API: Setting cookie for project ID:', projectId);
    
    return response;
  } catch (error) {
    console.error('Error creating project:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to create project', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
