/**
 * Track API usage for rate limit monitoring and quota management
 */

import { supabase } from '@/lib/supabase';

export interface UsageLog {
  id?: string;
  user_id?: string;
  timestamp: number;
  model: string;
  tokens_used: number;
  slide_count: number;
  status: 'success' | 'failed';
  error_message?: string;
  input_type: string;
  cache_hit: boolean;
  queue_wait_ms: number;
}

export interface UsageStats {
  todayCount: number;
  todayTokens: number;
  thisMonthCount: number;
  thisMonthTokens: number;
  lastGenerationTime: number;
  requestsThisHour: number;
  hourlyLimit: number; // 15 requests/hour suggested
  dailyLimit: number; // 50 requests/day suggested
  isOverQuota: boolean;
}

class UsageTracker {
  private localLogs: UsageLog[] = [];
  private readonly LOCAL_KEY = 'nano_banana_usage_logs';
  private readonly STORAGE_LIMIT = 1000; // Keep last 1000 logs

  /**
   * Initialize tracker (load from localStorage)
   */
  init(): void {
    try {
      const stored = localStorage.getItem(this.LOCAL_KEY);
      if (stored) {
        this.localLogs = JSON.parse(stored);
      }
    } catch (e) {
      console.error('[v0] Failed to load usage logs:', e);
      this.localLogs = [];
    }
  }

  /**
   * Log a generation request
   */
  async logUsage(log: UsageLog, userId?: string): Promise<void> {
    const timestamp = Date.now();
    const fullLog: UsageLog = {
      ...log,
      timestamp,
    };

    // Save locally
    this.localLogs.unshift(fullLog);
    if (this.localLogs.length > this.STORAGE_LIMIT) {
      this.localLogs = this.localLogs.slice(0, this.STORAGE_LIMIT);
    }
    localStorage.setItem(this.LOCAL_KEY, JSON.stringify(this.localLogs));

    // Save to cloud if authenticated
    if (userId) {
      try {
        await supabase.from('usage_logs').insert({
          user_id: userId,
          timestamp,
          model: fullLog.model,
          tokens_used: fullLog.tokens_used,
          slide_count: fullLog.slide_count,
          status: fullLog.status,
          error_message: fullLog.error_message,
          input_type: fullLog.input_type,
          cache_hit: fullLog.cache_hit,
          queue_wait_ms: fullLog.queue_wait_ms,
        });
      } catch (e) {
        console.error('[v0] Failed to log usage to cloud:', e);
      }
    }
  }

  /**
   * Get usage statistics
   */
  getStats(userId?: string): UsageStats {
    const now = Date.now();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(now);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const hourStart = new Date(now - 60 * 60 * 1000);

    const logsToUse = this.localLogs; // In real app, would merge with cloud logs if userId exists

    const todayLogs = logsToUse.filter(
      l => l.timestamp >= todayStart.getTime() && l.timestamp <= todayEnd.getTime()
    );
    const monthLogs = logsToUse.filter(l => l.timestamp >= monthStart.getTime());
    const hourLogs = logsToUse.filter(l => l.timestamp >= hourStart.getTime());

    const todayCount = todayLogs.filter(l => l.status === 'success').length;
    const todayTokens = todayLogs.reduce((sum, l) => sum + l.tokens_used, 0);
    const thisMonthCount = monthLogs.filter(l => l.status === 'success').length;
    const thisMonthTokens = monthLogs.reduce((sum, l) => sum + l.tokens_used, 0);

    const requestsThisHour = hourLogs.filter(l => l.status === 'success').length;
    const hourlyLimit = 15;
    const dailyLimit = 50;

    return {
      todayCount,
      todayTokens,
      thisMonthCount,
      thisMonthTokens,
      lastGenerationTime: logsToUse[0]?.timestamp || 0,
      requestsThisHour,
      hourlyLimit,
      dailyLimit,
      isOverQuota: todayCount >= dailyLimit,
    };
  }

  /**
   * Check if user can make a request based on quota
   */
  canMakeRequest(): { allowed: boolean; reason: string } {
    const stats = this.getStats();

    if (stats.isOverQuota) {
      return {
        allowed: false,
        reason: `Daily limit reached (${stats.dailyLimit} requests). Try again tomorrow.`,
      };
    }

    if (stats.requestsThisHour >= stats.hourlyLimit) {
      return {
        allowed: false,
        reason: `Hourly limit reached (${stats.hourlyLimit} requests). Please wait before generating more.`,
      };
    }

    return { allowed: true, reason: '' };
  }

  /**
   * Get usage percentage for progress bar
   */
  getUsagePercentage(): number {
    const stats = this.getStats();
    return Math.min(100, Math.round((stats.todayCount / stats.dailyLimit) * 100));
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.localLogs = [];
    localStorage.removeItem(this.LOCAL_KEY);
  }
}

// Singleton instance
export const usageTracker = new UsageTracker();
