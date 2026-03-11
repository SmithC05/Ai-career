package com.aicareernavigator.backend.ai;

import java.util.List;

public record RoadmapGeneratorResponse(
    String targetCareer,
    Integer timelineMonths,
    String summary,
    List<RoadmapStep> steps
) {
}
