/**
 * Polling Registry
 * 
 * This module provides a global registry for tracking active polling requests.
 * It helps prevent duplicate polling and ensures proper cleanup of polling intervals.
 */

// Map of active polling requests: videoId -> { startTime, intervalId }
type PollingInfo = {
  startTime: number;
  intervalId: NodeJS.Timeout;
  lastChecked: number;
};

class PollingRegistry {
  private static instance: PollingRegistry;
  private activePolling: Map<string, PollingInfo>;
  private readonly MAX_POLLING_DURATION = 30 * 1000; // 30 seconds in milliseconds
  
  private constructor() {
    this.activePolling = new Map();
    
    // Set up a cleanup interval to prevent memory leaks
    setInterval(() => this.cleanupStalePolling(), 10000);
  }
  
  public static getInstance(): PollingRegistry {
    if (!PollingRegistry.instance) {
      PollingRegistry.instance = new PollingRegistry();
    }
    return PollingRegistry.instance;
  }
  
  /**
   * Register a new polling interval
   * 
   * @param videoId The video ID being polled
   * @param intervalId The interval ID returned by setInterval
   * @returns true if registration was successful, false if already registered
   */
  public registerPolling(videoId: string, intervalId: NodeJS.Timeout): boolean {
    // Check if this video ID is already being polled
    if (this.activePolling.has(videoId)) {
      console.log(`PollingRegistry: Video ID ${videoId} is already being polled`);
      return false;
    }
    
    // Register the new polling
    const now = Date.now();
    this.activePolling.set(videoId, {
      startTime: now,
      intervalId,
      lastChecked: now
    });
    
    console.log(`PollingRegistry: Registered polling for video ID ${videoId}`);
    console.log(`PollingRegistry: Active polling count: ${this.activePolling.size}`);
    
    return true;
  }
  
  /**
   * Update the last checked time for a video ID
   * 
   * @param videoId The video ID being polled
   */
  public updateLastChecked(videoId: string): void {
    const polling = this.activePolling.get(videoId);
    if (polling) {
      polling.lastChecked = Date.now();
      this.activePolling.set(videoId, polling);
    }
  }
  
  /**
   * Unregister a polling interval
   * 
   * @param videoId The video ID being polled
   * @returns true if unregistration was successful, false if not found
   */
  public unregisterPolling(videoId: string): boolean {
    if (!this.activePolling.has(videoId)) {
      return false;
    }
    
    // Clear the interval
    const polling = this.activePolling.get(videoId);
    if (polling) {
      clearInterval(polling.intervalId);
    }
    
    // Remove from the registry
    this.activePolling.delete(videoId);
    
    console.log(`PollingRegistry: Unregistered polling for video ID ${videoId}`);
    console.log(`PollingRegistry: Active polling count: ${this.activePolling.size}`);
    
    return true;
  }
  
  /**
   * Check if a video ID is being polled
   * 
   * @param videoId The video ID to check
   * @returns true if the video ID is being polled, false otherwise
   */
  public isPolling(videoId: string): boolean {
    return this.activePolling.has(videoId);
  }
  
  /**
   * Get the elapsed polling time for a video ID
   * 
   * @param videoId The video ID to check
   * @returns The elapsed time in milliseconds, or -1 if not found
   */
  public getElapsedTime(videoId: string): number {
    const polling = this.activePolling.get(videoId);
    if (!polling) {
      return -1;
    }
    
    return Date.now() - polling.startTime;
  }
  
  /**
   * Clean up stale polling intervals
   * 
   * This method is called periodically to clean up polling intervals
   * that have been running for too long or haven't been checked recently.
   */
  private cleanupStalePolling(): void {
    console.log('PollingRegistry: Running cleanup of stale polling intervals');
    console.log(`PollingRegistry: Active polling count before cleanup: ${this.activePolling.size}`);
    
    if (this.activePolling.size === 0) {
      console.log('PollingRegistry: No active polling to clean up');
      return;
    }
    
    const now = Date.now();
    const staleThreshold = 5000; // 5 seconds (reduced from 10 seconds)
    
    // Convert Map entries to array to avoid TypeScript error
    const entries = Array.from(this.activePolling.entries());
    console.log(`PollingRegistry: Checking ${entries.length} active polling intervals`);
    
    for (const [videoId, polling] of entries) {
      const elapsedTime = now - polling.startTime;
      const timeSinceLastCheck = now - polling.lastChecked;
      const elapsedSeconds = Math.floor(elapsedTime / 1000);
      
      console.log(`PollingRegistry: Video ID ${videoId} - elapsed time: ${elapsedSeconds}s, time since last check: ${timeSinceLastCheck}ms`);
      
      // Check if polling has been running for too long
      if (elapsedTime > this.MAX_POLLING_DURATION) {
        console.log(`PollingRegistry: Cleaning up stale polling for video ID ${videoId} (exceeded max duration of ${Math.floor(this.MAX_POLLING_DURATION/1000)}s)`);
        this.unregisterPolling(videoId);
        continue;
      }
      
      // Check if polling hasn't been checked recently
      if (timeSinceLastCheck > staleThreshold) {
        console.log(`PollingRegistry: Cleaning up stale polling for video ID ${videoId} (not checked in ${timeSinceLastCheck}ms)`);
        this.unregisterPolling(videoId);
      }
    }
    
    console.log(`PollingRegistry: Active polling count after cleanup: ${this.activePolling.size}`);
  }
  
  /**
   * Get the count of active polling requests
   * 
   * @returns The number of active polling requests
   */
  public getActiveCount(): number {
    return this.activePolling.size;
  }
  
  /**
   * Get all active polling video IDs
   * 
   * @returns An array of active polling video IDs
   */
  public getActiveVideoIds(): string[] {
    return Array.from(this.activePolling.keys());
  }
}

// Export the singleton instance
export const pollingRegistry = PollingRegistry.getInstance();
