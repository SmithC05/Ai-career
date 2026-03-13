package com.aicareernavigator.backend.quiz;

import java.util.List;
import java.util.UUID;

public record QuizRecommendationResponse(
    UUID careerId,
    String careerName,
    String description,
    String category,
    int matchPercentage,
    List<String> strengths
) {
}
