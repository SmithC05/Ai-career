package com.aicareernavigator.backend.interview;

import java.util.List;

/** AI-generated feedback for a single answered question. */
public record InterviewFeedback(
        int score,
        String feedback,
        List<String> strengths,
        List<String> improvements
) {}
