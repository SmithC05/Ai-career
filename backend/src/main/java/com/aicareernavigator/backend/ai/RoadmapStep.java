package com.aicareernavigator.backend.ai;

import java.util.List;

public record RoadmapStep(
    Integer phase,
    String title,
    String details,
    List<String> resources
) {
}
