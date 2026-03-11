package com.aicareernavigator.backend.ai;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record PersonalizedLearningPathRequest(
    @NotBlank(message = "Target career is required")
    String targetCareer,
    List<String> currentSkills,

    @Min(value = 1, message = "Weekly hours must be at least 1")
    @Max(value = 40, message = "Weekly hours must be at most 40")
    Integer weeklyHours,

    @NotBlank(message = "Learning style is required")
    String learningStyle,

    @Min(value = 1, message = "Timeline must be at least 1 month")
    @Max(value = 24, message = "Timeline must be at most 24 months")
    Integer timelineMonths
) {
}
