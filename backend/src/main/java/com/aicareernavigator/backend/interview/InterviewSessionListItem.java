package com.aicareernavigator.backend.interview;

import java.time.Instant;
import java.util.UUID;

/** Lightweight session list item for the sessions list endpoint. */
public record InterviewSessionListItem(
        UUID id,
        String targetRole,
        String difficulty,
        Instant createdAt
) {}
