package com.aicareernavigator.backend.resumeportfolio;

import com.aicareernavigator.backend.ai.ResumePortfolioBuilderResponse;

import java.util.UUID;

public record GenerateResumePortfolioResponse(
    UUID resumePortfolioId,
    ResumePortfolioBuilderResponse resumePortfolio
) {
}
