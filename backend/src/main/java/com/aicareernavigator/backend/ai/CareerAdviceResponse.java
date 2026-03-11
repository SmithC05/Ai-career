package com.aicareernavigator.backend.ai;

import java.util.List;

public record CareerAdviceResponse(
    String answer,
    List<String> suggestedCareers,
    List<String> nextSteps
) {
}
