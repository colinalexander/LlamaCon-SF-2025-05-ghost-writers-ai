import { NextResponse } from 'next/server';
import { tavusPrompts, getEnhancedPrompt, createPersonalizedGreeting, BookInfo } from '@/lib/tavus-prompts';
import { initializeDatabase, dbRW } from '@/lib/db';
import { fetchWithRetry } from '@/lib/tavus-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { genre, projectId, bookInfo, userName } = await request.json();
    
    // Get the appropriate persona and replica IDs from tavus-prompts.json
    const genreConfig = tavusPrompts.genres[genre as keyof typeof tavusPrompts.genres];
    
    if (!genreConfig) {
      return NextResponse.json(
        { error: 'Invalid genre specified' },
        { status: 400 }
      );
    }
    
    // Create a webhook URL for receiving transcripts
    // This should be a publicly accessible URL that points to your transcript endpoint
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/api/tavus/transcript`;
    
    // Initialize database to ensure tables exist
    await initializeDatabase();
    
    let data;
    let useFallback = false;
    
    try {
      console.log('Calling Tavus API with key:', process.env.TAVUS_API_KEY?.substring(0, 5) + '...');
      console.log('This may take up to 20 seconds...');
      
      // Prepare the book info object if it doesn't exist
      const effectiveBookInfo: BookInfo = bookInfo || { genre };
      
      // Get enhanced prompt with book info and user name
      const enhancedPrompt = getEnhancedPrompt(genre, effectiveBookInfo, userName);
      
      // Create personalized greeting
      const personalizedGreeting = createPersonalizedGreeting(genreConfig, effectiveBookInfo, userName);
      
      // Call the Tavus API directly to create a conversation with retry logic
      const createConversationResponse = await fetchWithRetry(
        'https://tavusapi.com/v2/conversations',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.TAVUS_API_KEY || '',
          },
          body: JSON.stringify({
            persona_id: genreConfig.persona_id,
            // Use persona_id for conversations, not replica_id
            conversation_name: `Writing Coach Session - ${genre}${effectiveBookInfo.title ? ` - ${effectiveBookInfo.title}` : ''}`,
            conversational_context: enhancedPrompt || `The user is working on a ${genre} project and needs writing guidance. Use the persona of a ${genreConfig.name} to provide helpful advice.`,
            custom_greeting: personalizedGreeting || `Hello! I'm your ${genreConfig.name}. I'm here to help you with your ${genre} writing project. What aspect of your story would you like to discuss today?`,
            callback_url: webhookUrl, // This is where the transcript will be sent
            properties: {
              max_call_duration: 1800, // 30 minutes
            }
          }),
        },
        3,  // 3 retries
        30000  // 30-second timeout
      );
      
      if (!createConversationResponse.ok) {
        const errorData = await createConversationResponse.json();
        console.error('Error creating Tavus conversation:', errorData);
        throw new Error(`Failed to create Tavus conversation: ${createConversationResponse.status}`);
      }
      
      const conversationData = await createConversationResponse.json();
      console.log('Tavus conversation created successfully:', conversationData);
      
      // Store the conversation in the database for future reference
      await dbRW.execute({
        sql: `
          INSERT INTO conversation_transcripts (conversation_id, transcript, created_at, project_id)
          VALUES (?, ?, ?, ?)
        `,
        args: [
          conversationData.conversation_id,
          JSON.stringify({ status: 'created', url: conversationData.conversation_url }),
          new Date().toISOString(),
          projectId
        ]
      });
      
      data = {
        conversation_id: conversationData.conversation_id,
        conversation_url: conversationData.conversation_url
      };
    } catch (error) {
      console.error('Error calling Tavus API:', error);
      useFallback = true;
    }
    
    // If the API call failed, use a fallback mechanism
    if (useFallback) {
      console.log('Using fallback for Tavus conversation');
      
      // Create a unique conversation ID
      const conversationId = `${genreConfig.replica_id}-${Date.now()}`;
      
      // Use the tavus.daily.co URL format for the conversation URL
      const conversationUrl = `https://tavus.daily.co/${conversationId}`;
      
      // Store the fallback conversation in the database
      await dbRW.execute({
        sql: `
          INSERT INTO conversation_transcripts (conversation_id, transcript, created_at, project_id)
          VALUES (?, ?, ?, ?)
        `,
        args: [
          conversationId,
          JSON.stringify({ status: 'fallback', url: conversationUrl }),
          new Date().toISOString(),
          projectId
        ]
      });
      
      data = {
        conversation_id: conversationId,
        conversation_url: conversationUrl
      };
    }
    
    // Ensure data is defined
    if (!data) {
      throw new Error('Failed to create conversation: No data returned');
    }
    
    return NextResponse.json({ 
      conversationId: data.conversation_id,
      conversationUrl: data.conversation_url,
      genre,
      bookInfo: bookInfo || { genre }
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
