package com.aicareernavigator.backend.ai;

import java.util.List;

public record SkillGapAnalysisResponse(
    String targetCareer,
    List<String> currentSkills,
    List<String> missingSkills,
    List<String> recommendations
) {
}
