package com.aicareernavigator.backend.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SkillGapAnalysisRequest(
    @NotBlank(message = "Target career is required")
    String targetCareer,

    @NotEmpty(message = "Current skills are required")
    List<String> currentSkills
) {
}
