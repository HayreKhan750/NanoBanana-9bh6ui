/**
 * Usage Dashboard - Shows API usage quota and remaining requests
 */

import React from 'react';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, Zap } from 'lucide-react';

interface UsageDashboardProps {
  userId?: string;
  className?: string;
  compact?: boolean;
}

export function UsageDashboard({
  userId,
  className = '',
  compact = false,
}: UsageDashboardProps) {
  const { stats, percentage, isOverQuota, canMakeRequest, remainingToday } = useUsageTracking(userId);

  // Determine color based on usage
  let progressColor = 'bg-green-500';
  let statusText = 'All good';
  let statusIcon = null;

  if (isOverQuota) {
    progressColor = 'bg-red-500';
    statusText = 'Quota exceeded';
    statusIcon = <AlertCircle className="w-4 h-4 text-red-500" />;
  } else if (percentage > 80) {
    progressColor = 'bg-yellow-500';
    statusText = 'Quota warning';
    statusIcon = <Zap className="w-4 h-4 text-yellow-500" />;
  } else if (percentage >= 50) {
    progressColor = 'bg-blue-500';
    statusText = 'On track';
    statusIcon = null;
  } else {
    statusIcon = <CheckCircle2 className="w-4 h-4 text-green-500" />;
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface border border-border ${className}`}>
        <div className="flex items-center gap-1.5 flex-1">
          <div className="flex items-center gap-1">
            {statusIcon}
            <span className="text-xs font-medium text-muted-foreground">
              {stats.todayCount}/{stats.dailyLimit} today
            </span>
          </div>
        </div>
        <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} transition-all`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full p-4 rounded-lg border border-border bg-surface space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground">API Usage</h3>
          <p className="text-sm text-muted-foreground">Daily quota</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">{percentage}%</div>
          <p className="text-xs text-muted-foreground">{stats.todayCount}/{stats.dailyLimit}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={Math.min(100, percentage)} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{remainingToday} remaining today</span>
          <span>{Math.round((Date.now() - stats.lastGenerationTime) / 1000)}s ago</span>
        </div>
      </div>

      {/* Status Message */}
      <div className={`flex items-center gap-2 p-3 rounded-md ${
        isOverQuota
          ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-200'
          : percentage > 80
          ? 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-200'
          : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-200'
      }`}>
        {statusIcon && <div className="flex-shrink-0">{statusIcon}</div>}
        <div className="flex-1">
          <p className="text-sm font-medium">{statusText}</p>
          {!canMakeRequest && (
            <p className="text-xs opacity-75">Come back tomorrow for more generations</p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">This month</p>
          <p className="text-lg font-semibold text-foreground">{stats.thisMonthCount}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Hourly limit</p>
          <p className="text-lg font-semibold text-foreground">{stats.requestsThisHour}/{stats.hourlyLimit}</p>
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md space-y-1">
        <p>• Using Groq/Mixtral for fastest generation</p>
        <p>• Requests are cached for 30 days</p>
        <p>• Quota resets daily at midnight</p>
      </div>
    </div>
  );
}
