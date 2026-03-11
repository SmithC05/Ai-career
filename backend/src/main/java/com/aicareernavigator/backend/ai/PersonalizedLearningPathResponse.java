package com.aicareernavigator.backend.ai;

import java.util.List;

public record PersonalizedLearningPathResponse(
    String targetCareer,
    Integer timelineMonths,
    Integer weeklyHours,
    String learningStyle,
    String summary,
    List<LearningPathMilestone> milestones,
    List<String> resources
) {
}
