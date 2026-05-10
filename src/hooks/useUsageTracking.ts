/**
 * Hook for tracking and monitoring API usage quotas
 */

import { useEffect, useState } from 'react';
import { usageTracker, type UsageStats } from '@/lib/usageTracker';

export interface UseUsageTrackingResult {
  stats: UsageStats;
  percentage: number;
  isOverQuota: boolean;
  canMakeRequest: boolean;
  quotaWarning: string;
  refreshStats: () => void;
  remainingToday: number;
}

export function useUsageTracking(userId?: string): UseUsageTrackingResult {
  const [stats, setStats] = useState<UsageStats>(() => usageTracker.getStats(userId));
  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    // Initialize tracker on first mount
    usageTracker.init();
    setStats(usageTracker.getStats(userId));

    // Poll stats every 5 seconds
    const interval = setInterval(() => {
      setStats(usageTracker.getStats(userId));
    }, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  const percentage = usageTracker.getUsagePercentage();
  const canMakeRequest = usageTracker.canMakeRequest().allowed;
  const { reason: quotaWarning } = usageTracker.canMakeRequest();
  const remainingToday = Math.max(0, stats.dailyLimit - stats.todayCount);

  const refreshStats = () => {
    setStats(usageTracker.getStats(userId));
    setRefreshKey(k => k + 1);
  };

  return {
    stats,
    percentage,
    isOverQuota: stats.isOverQuota,
    canMakeRequest,
    quotaWarning,
    refreshStats,
    remainingToday,
  };
}
