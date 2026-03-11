package com.aicareernavigator.backend.ai;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record RoadmapGeneratorRequest(
    @NotBlank(message = "Target career is required")
    String targetCareer,
    List<String> currentSkills,
    Integer timelineMonths
) {
}
