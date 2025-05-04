import tavusPromptsData from '../tavus-prompts.json';

export const tavusPrompts = tavusPromptsData;

export interface BookInfo {
  genre: string;
  audience?: string;
  style?: string;
  storyLength?: string;
  title?: string;
  description?: string;
  tone?: string;
}

export function getGenreConfig(genre: string) {
  return tavusPrompts.genres[genre as keyof typeof tavusPrompts.genres];
}

export function getAllGenres() {
  return Object.keys(tavusPrompts.genres).map(key => ({
    id: key,
    name: tavusPrompts.genres[key as keyof typeof tavusPrompts.genres].name
  }));
}

export function getEnhancedPrompt(genre: string, bookInfo: BookInfo, userName?: string) {
  const genreConfig = getGenreConfig(genre);
  if (!genreConfig) return null;
  
  // Format book info as a structured object
  const formattedBookInfo = {
    genre: bookInfo.genre,
    target_audience: bookInfo.audience,
    writing_style: bookInfo.style,
    story_length: bookInfo.storyLength,
    story_title: bookInfo.title,
    description: bookInfo.description,
    story_tone: bookInfo.tone
  };
  
  // Create personalized greeting with user's first name if available
  const firstName = userName && userName.trim() !== '' ? userName.split(' ')[0] : 'the author';
  
  // Append book info and personalization instructions to the original prompt
  return `${genreConfig.prompt}

Here is the project info: ${JSON.stringify(formattedBookInfo, null, 2)}

Throughout your conversation with ${firstName}, frequently reference specific details about their project to personalize your guidance:
1. Refer to their story by title "${bookInfo.title || 'their story'}" when discussing plot elements
2. Acknowledge the ${bookInfo.tone || 'chosen'} tone and ${bookInfo.style || 'selected'} style when giving writing advice
3. Tailor your examples to be relevant for a ${bookInfo.audience || 'general'} audience
4. Consider the ${bookInfo.storyLength || 'planned'} length when discussing pacing and structure
5. Reference elements from their description: "${bookInfo.description || 'their concept'}" when appropriate

When greeting the author, address them as "${firstName}" and acknowledge key aspects of their project.`;
}

export function createPersonalizedGreeting(genreConfig: any, bookInfo: BookInfo, userName?: string) {
  // Handle empty or undefined userName
  const firstName = userName && userName.trim() !== '' ? userName.split(' ')[0] : 'there';
  
  // Create a personalized greeting that acknowledges specific project details
  let greeting = `Hello ${firstName}! I'm your ${genreConfig.name}.`;
  
  // Add title acknowledgment if available
  if (bookInfo.title) {
    greeting += ` I'm excited to help you with your ${bookInfo.genre} project "${bookInfo.title}".`;
  } else {
    greeting += ` I'm here to help you with your ${bookInfo.genre} writing project.`;
  }
  
  // Add description acknowledgment if available
  if (bookInfo.description) {
    greeting += ` Your concept about "${bookInfo.description}" has a lot of potential.`;
  }
  
  // Add tone/style acknowledgment
  if (bookInfo.tone && bookInfo.style) {
    greeting += ` I see you're aiming for a ${bookInfo.tone} tone with a ${bookInfo.style} writing style - an excellent combination.`;
  } else if (bookInfo.tone) {
    greeting += ` I like your choice of a ${bookInfo.tone} tone for this work.`;
  } else if (bookInfo.style) {
    greeting += ` Your ${bookInfo.style} writing style will work well for this project.`;
  }
  
  // Add audience acknowledgment
  if (bookInfo.audience) {
    greeting += ` Writing for a ${bookInfo.audience} audience gives us clear direction.`;
  }
  
  // Add closing question
  greeting += ` What specific aspect of your story would you like to discuss today?`;
  
  return greeting;
}
