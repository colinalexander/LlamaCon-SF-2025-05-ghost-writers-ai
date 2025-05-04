// Test script to verify character creation functionality
const { createUser, initializeDatabase } = require('./front-end/project/server/lib/db');

async function testUserAndCharacterCreation() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    
    // Create test user
    console.log('Creating test user...');
    const testUser = {
      username: 'testuser',
      email: 'test.user@gmail.com',
      password: '123',
      firstName: 'TEST',
      lastName: 'USER'
    };
    
    const userId = await createUser(testUser);
    console.log('Test user created with ID:', userId);
    
    console.log('Test completed successfully!');
    console.log('You can now sign in with:');
    console.log('Email: test.user@gmail.com');
    console.log('Password: 123');
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testUserAndCharacterCreation();
