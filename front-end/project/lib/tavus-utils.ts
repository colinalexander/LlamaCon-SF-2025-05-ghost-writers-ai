/**
 * Utility functions for Tavus integration.
 */

/**
 * Determines whether to use the mock Tavus player instead of the real one.
 * 
 * This function checks if:
 * 1. The MOCK_TAVUS environment variable is set to 'true'
 * 2. The Tavus domain is not reachable (checked via a cached status)
 * 
 * @returns {boolean} True if the mock player should be used, false otherwise
 */
export function useMockTavusPlayer(): boolean {
  // Check if the MOCK_TAVUS environment variable is set
  // This is the primary control for whether to use the mock player
  const mockTavusEnv = process.env.NEXT_PUBLIC_MOCK_TAVUS === 'true';
  
  // In client-side code, we can also check if we've previously had issues with Tavus
  let hasTavusIssues = false;
  if (typeof window !== 'undefined') {
    hasTavusIssues = localStorage.getItem('tavus_connection_issues') === 'true';
  }
  
  // Only use the mock player if explicitly enabled or if there have been connection issues
  return mockTavusEnv || hasTavusIssues;
}

/**
 * Records that there was an issue connecting to Tavus.
 * This will cause useMockTavusPlayer to return true in future calls.
 */
export function recordTavusConnectionIssue(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tavus_connection_issues', 'true');
  }
}

/**
 * Clears the record of Tavus connection issues.
 */
export function clearTavusConnectionIssue(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tavus_connection_issues');
  }
}

/**
 * Generates a mock Tavus video URL.
 * 
 * @param {string} videoId - The video ID
 * @returns {string} A mock URL that will be intercepted by our mock player
 */
export function getMockTavusVideoUrl(videoId: string): string {
  return `mock-tavus://${videoId}`;
}

/**
 * Generates a mock Tavus conversation URL.
 * 
 * @param {string} conversationId - The conversation ID
 * @returns {string} A mock URL that will be intercepted by our mock player
 */
export function getMockTavusConversationUrl(conversationId: string): string {
  return `mock-tavus-conversation://${conversationId}`;
}

/**
 * Fetches with retry logic and extended timeout for Tavus API calls.
 * 
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {number} retries - Number of retries (default: 3)
 * @param {number} timeout - Timeout in milliseconds (default: 30000)
 * @returns {Promise<Response>} The fetch response
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  timeout = 30000
): Promise<Response> {
  try {
    // Use a Promise with a timeout to handle the fetch
    const fetchPromise = new Promise<Response>(async (resolve, reject) => {
      try {
        // Create a timeout that will reject the promise after the specified time
        const timeoutId = setTimeout(() => {
          reject(new Error(`Request to ${url} timed out after ${timeout}ms`));
        }, timeout);
        
        // Attempt the fetch
        const response = await fetch(url, options);
        
        // Clear the timeout if the fetch succeeds
        clearTimeout(timeoutId);
        
        // Resolve with the response
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
    
    // Wait for the fetch to complete or timeout
    return await fetchPromise;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error);
    
    // If we have retries left, try again
    if (retries > 0) {
      console.log(`Retrying Tavus API call to ${url}, ${retries} retries left`);
      // Wait a bit before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
      return fetchWithRetry(url, options, retries - 1, timeout);
    }
    
    // No more retries, throw the error
    throw error;
  }
}
