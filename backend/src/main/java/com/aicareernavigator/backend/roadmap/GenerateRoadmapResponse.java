package com.aicareernavigator.backend.roadmap;

import com.aicareernavigator.backend.ai.RoadmapGeneratorResponse;

import java.util.UUID;

public record GenerateRoadmapResponse(
    UUID roadmapId,
    RoadmapGeneratorResponse roadmap
) {
}
