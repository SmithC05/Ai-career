package com.aicareernavigator.backend.dashboard;

public record DashboardAnalyticsResponse(
    int completionScore,
    int completedMilestones,
    int totalMilestones,
    int weeklyTarget,
    int weeklyProgress,
    int previousWeekProgress,
    double trendPercentage,
    String trendDirection
) {
}
