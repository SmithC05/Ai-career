package com.aicareernavigator.backend.learningpath;

import java.time.Instant;
import java.util.UUID;

public record LearningPathListItem(
    UUID id,
    String title,
    String content,
    Instant createdAt
) {
}
