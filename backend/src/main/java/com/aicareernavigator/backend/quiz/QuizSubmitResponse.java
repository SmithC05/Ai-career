package com.aicareernavigator.backend.quiz;

import java.time.Instant;
import java.util.List;

public record QuizSubmitResponse(
    List<QuizRecommendationResponse> recommendations,
    Instant completedAt
) {
}
