/**
 * Request Queue for AI generation
 * Prevents rate limiting by:
 * - Limiting concurrent requests (max 2)
 * - Limiting requests per minute (max 30)
 * - Deduplicating simultaneous identical requests
 */

export interface QueuedRequest {
  id: string;
  promptHash: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
}

export class AIQueue {
  private queue: Map<string, QueuedRequest> = new Map();
  private processing: Set<string> = new Set();
  private requestTimestamps: number[] = [];
  
  // Configuration
  private readonly MAX_CONCURRENT = 2;
  private readonly MAX_PER_MINUTE = 30;
  private readonly RATE_WINDOW_MS = 60000; // 1 minute

  /**
   * Hash a prompt to detect duplicates
   */
  static hashPrompt(prompt: string, config: Record<string, unknown>): string {
    const str = `${prompt}|${JSON.stringify(config)}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `hash_${Math.abs(hash)}`;
  }

  /**
   * Check if identical request is already being processed
   */
  hasActiveRequest(promptHash: string): QueuedRequest | null {
    for (const [, req] of this.queue) {
      if (req.promptHash === promptHash && (req.status === 'processing' || req.status === 'pending')) {
        return req;
      }
    }
    return null;
  }

  /**
   * Add request to queue and return a promise that resolves when processed
   */
  async enqueue<T>(
    promptHash: string,
    execute: () => Promise<T>,
    onStatusChange?: (status: QueuedRequest) => void
  ): Promise<T> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const request: QueuedRequest = {
      id: requestId,
      promptHash,
      status: 'pending',
      createdAt: Date.now(),
    };

    this.queue.set(requestId, request);
    onStatusChange?.(request);

    // Wait for our turn
    while (this.processing.size >= this.MAX_CONCURRENT || !this.canMakeRequest()) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Check rate limit
    const now = Date.now();
    this.requestTimestamps = this.requestTimestamps.filter(ts => now - ts < this.RATE_WINDOW_MS);
    
    if (this.requestTimestamps.length >= this.MAX_PER_MINUTE) {
      // Wait for rate limit window to clear
      const oldestRequest = this.requestTimestamps[0];
      const waitTime = (this.RATE_WINDOW_MS - (now - oldestRequest)) + 100;
      await new Promise(resolve => setTimeout(resolve, Math.max(0, waitTime)));
      this.requestTimestamps = this.requestTimestamps.filter(ts => Date.now() - ts < this.RATE_WINDOW_MS);
    }

    // Process request
    this.processing.add(requestId);
    request.status = 'processing';
    request.startedAt = Date.now();
    this.requestTimestamps.push(Date.now());
    onStatusChange?.(request);

    try {
      const result = await execute();
      request.status = 'completed';
      request.completedAt = Date.now();
      onStatusChange?.(request);
      return result;
    } catch (error) {
      request.status = 'failed';
      request.error = error instanceof Error ? error.message : String(error);
      request.completedAt = Date.now();
      onStatusChange?.(request);
      throw error;
    } finally {
      this.processing.delete(requestId);
      // Keep request in queue for a bit for UI to show status
      setTimeout(() => {
        this.queue.delete(requestId);
      }, 5000);
    }
  }

  /**
   * Check if we can make a request based on rate limits
   */
  private canMakeRequest(): boolean {
    const now = Date.now();
    const recentRequests = this.requestTimestamps.filter(ts => now - ts < this.RATE_WINDOW_MS);
    return recentRequests.length < this.MAX_PER_MINUTE;
  }

  /**
   * Get current queue status
   */
  getStatus() {
    return {
      queueSize: this.queue.size,
      processing: this.processing.size,
      totalRequests: this.queue.size + this.processing.size,
      requestsThisMinute: this.requestTimestamps.filter(ts => Date.now() - ts < this.RATE_WINDOW_MS).length,
    };
  }

  /**
   * Get position in queue for a request
   */
  getQueuePosition(requestId: string): number {
    const request = this.queue.get(requestId);
    if (!request || request.status === 'completed' || request.status === 'failed') {
      return -1;
    }

    let position = 0;
    for (const [id, req] of this.queue) {
      if (id === requestId) break;
      if (req.status === 'pending') position++;
    }
    return position;
  }

  /**
   * Clear completed requests
   */
  clearCompleted() {
    for (const [id, req] of this.queue) {
      if (req.status === 'completed' || req.status === 'failed') {
        this.queue.delete(id);
      }
    }
  }
}

// Singleton instance
export const aiQueue = new AIQueue();
