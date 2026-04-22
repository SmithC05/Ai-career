package com.aicareernavigator.backend.interview;

import java.util.List;

/** One interview question with expected keyword hints. */
public record InterviewQuestion(
        String question,
        String type,
        List<String> expectedKeywords
) {}
