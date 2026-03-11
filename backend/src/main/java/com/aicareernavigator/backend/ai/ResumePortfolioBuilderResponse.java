package com.aicareernavigator.backend.ai;

import java.util.List;

public record ResumePortfolioBuilderResponse(
    String headline,
    String professionalSummary,
    List<ResumeSection> resumeSections,
    List<PortfolioProject> portfolioProjects,
    List<String> atsKeywords
) {
}
