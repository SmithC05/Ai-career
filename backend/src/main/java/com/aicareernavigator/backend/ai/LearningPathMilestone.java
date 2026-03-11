package com.aicareernavigator.backend.ai;

import java.util.List;

public record LearningPathMilestone(
    Integer week,
    String focus,
    List<String> outcomes,
    List<String> tasks
) {
}
