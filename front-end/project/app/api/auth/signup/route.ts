import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, email, password, firstName, lastName } = await request.json();
    
    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Import DB functions
    const { getUserByEmail, createUser } = await import('@/server/lib/db');
    
    // Check if user exists
    const existingUser = await getUserByEmail(email);
    
    if (existingUser) {
      console.log('Signup API: Email already in use:', email);
      return NextResponse.json(
        { error: 'Email already in use', code: 'EMAIL_EXISTS' },
        { status: 409 }
      );
    }
    
    // Create new user
    const userId = await createUser({ username, email, password, firstName, lastName });
    const user = { id: userId, username, email, firstName, lastName };
    
    // Create response with user data
    const response = NextResponse.json(user);
    
    // Set cookie
    response.cookies.set('userId', user.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false, // Allow JavaScript access
    });
    
    return response;
  } catch (error) {
    console.error('Sign up error:', error);
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to sign up', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
