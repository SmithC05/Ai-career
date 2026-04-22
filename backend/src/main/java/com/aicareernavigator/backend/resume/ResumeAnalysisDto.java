package com.aicareernavigator.backend.resume;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO returned to the frontend after a resume analysis.
 */
public record ResumeAnalysisDto(
        UUID id,
        List<String> extractedSkills,
        String jobDescription,
        int matchScore,
        List<String> suggestions,
        List<String> improvementAreas,
        Instant createdAt
) {}
