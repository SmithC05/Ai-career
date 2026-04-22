package com.aicareernavigator.backend.interview;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Full session DTO returned to the frontend. */
public record InterviewSessionDto(
        UUID id,
        String targetRole,
        String difficulty,
        List<InterviewQuestion> questions,
        List<String> answers,
        List<InterviewFeedback> feedback,
        Instant createdAt
) {}
