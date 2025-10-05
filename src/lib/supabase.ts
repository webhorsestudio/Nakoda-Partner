import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Get environment variables with proper fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tujaxamxrdkkdvwnjcxh.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1amF4YW14cmRra2R2d25qY3hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NjY1NTIsImV4cCI6MjA3MDI0MjU1Mn0.GFYUmFzn0kbPSym0JZjadpqUwEwvwHfjo59K2VEm6eA";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Regular Supabase client for client-side operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public'
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Admin Supabase client with service role key for server-side admin operations
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'nakoda-partner-admin'
    }
  }
});

// Circuit breaker for database operations
class DatabaseCircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private readonly failureThreshold = 3;
  private readonly timeout = 2 * 60 * 1000; // 2 minutes
  private readonly successThreshold = 2;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
        console.log('🔄 Database Circuit Breaker: Attempting reset (HALF_OPEN)');
      } else {
        throw new Error('Database circuit breaker is OPEN - Service temporarily unavailable');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log('✅ Database Circuit Breaker: Reset successful (CLOSED)');
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.log('🚨 Database Circuit Breaker: Opened due to failures');
    }
  }

  private shouldAttemptReset(): boolean {
    return this.lastFailureTime !== null && 
           (Date.now() - this.lastFailureTime) >= this.timeout;
  }

  getState(): string {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }
}

export const databaseCircuitBreaker = new DatabaseCircuitBreaker();

// Wrapper function for admin database operations with circuit breaker
export async function executeAdminQuery<T>(operation: () => Promise<T>): Promise<T> {
  return databaseCircuitBreaker.execute(operation);
}
