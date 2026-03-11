package com.aicareernavigator.backend.dashboard;

import com.aicareernavigator.backend.career.CareerSummaryResponse;
import com.aicareernavigator.backend.learningpath.LearningPathListItem;
import com.aicareernavigator.backend.resumeportfolio.ResumePortfolioListItem;
import com.aicareernavigator.backend.roadmap.RoadmapListItem;

import java.util.List;

public record DashboardResponse(
    List<CareerSummaryResponse> savedCareers,
    List<RoadmapListItem> roadmaps,
    List<LearningPathListItem> learningPaths,
    List<ResumePortfolioListItem> resumePortfolios,
    List<CareerSummaryResponse> recommendations,
    DashboardAnalyticsResponse analytics
) {
}
