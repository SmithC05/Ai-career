package com.aicareernavigator.backend.learningpath;

import com.aicareernavigator.backend.ai.PersonalizedLearningPathResponse;

import java.util.UUID;

public record GenerateLearningPathResponse(
    UUID learningPathId,
    PersonalizedLearningPathResponse learningPath
) {
}
