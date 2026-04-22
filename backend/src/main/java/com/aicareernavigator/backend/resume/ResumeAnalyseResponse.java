package com.aicareernavigator.backend.resume;

import java.util.List;

/**
 * Response from the FastAPI AI service for resume analysis.
 */
public record ResumeAnalyseResponse(
        List<String> extractedSkills,
        int matchScore,
        List<String> suggestions,
        List<String> improvementAreas
) {}
