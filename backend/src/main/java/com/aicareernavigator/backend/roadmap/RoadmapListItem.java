package com.aicareernavigator.backend.roadmap;

import java.time.Instant;
import java.util.UUID;

public record RoadmapListItem(
    UUID id,
    String title,
    String content,
    Instant createdAt
) {
}
