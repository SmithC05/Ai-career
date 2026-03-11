package com.aicareernavigator.backend.career;

public record CareerComparisonResponse(
    CareerMetricResponse careerA,
    CareerMetricResponse careerB,
    String summary
) {
}
