/**
 * Intelligent Rate Limiter with Adaptive Backoff
 * Learns from API responses and adjusts timing dynamically
 */
class IntelligentRateLimiter {
  private lastRequestTime = 0;
  private baseDelay = 1000; // Start with 1 second
  private maxDelay = 30000; // Max 30 seconds
  private minDelay = 500;   // Min 500ms
  private consecutiveSuccesses = 0;
  private consecutiveFailures = 0;
  private readonly successThreshold = 3;
  private readonly failureThreshold = 2;

  async waitForNextRequest(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.baseDelay) {
      const waitTime = this.baseDelay - timeSinceLastRequest;
      console.log(`⏳ Rate Limiter: Waiting ${waitTime}ms before next request`);
      await this.sleep(waitTime);
    }
    
    this.lastRequestTime = Date.now();
  }

  onSuccess(): void {
    this.consecutiveSuccesses++;
    this.consecutiveFailures = 0;
    
    // Reduce delay after consecutive successes
    if (this.consecutiveSuccesses >= this.successThreshold) {
      this.baseDelay = Math.max(this.minDelay, this.baseDelay * 0.8);
      console.log(`📈 Rate Limiter: Reducing delay to ${this.baseDelay}ms (success streak: ${this.consecutiveSuccesses})`);
    }
  }

  onRateLimit(): void {
    this.consecutiveFailures++;
    this.consecutiveSuccesses = 0;
    
    // Increase delay after rate limit hits
    this.baseDelay = Math.min(this.maxDelay, this.baseDelay * 2);
    console.log(`📉 Rate Limiter: Increasing delay to ${this.baseDelay}ms (failure streak: ${this.consecutiveFailures})`);
  }

  onError(): void {
    this.consecutiveFailures++;
    this.consecutiveSuccesses = 0;
    
    // Moderate increase for other errors
    this.baseDelay = Math.min(this.maxDelay, this.baseDelay * 1.5);
    console.log(`⚠️ Rate Limiter: Moderate delay increase to ${this.baseDelay}ms`);
  }

  getCurrentDelay(): number {
    return this.baseDelay;
  }

  getStats(): { delay: number; successes: number; failures: number } {
    return {
      delay: this.baseDelay,
      successes: this.consecutiveSuccesses,
      failures: this.consecutiveFailures
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const bitrix24RateLimiter = new IntelligentRateLimiter();
