package com.aicareernavigator.backend.resumeportfolio;

import java.time.Instant;
import java.util.UUID;

public record ResumePortfolioListItem(
    UUID id,
    String title,
    String targetCareer,
    String content,
    Instant createdAt
) {
}
