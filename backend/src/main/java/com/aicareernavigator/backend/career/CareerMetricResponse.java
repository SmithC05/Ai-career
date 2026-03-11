package com.aicareernavigator.backend.career;

import java.math.BigDecimal;
import java.util.UUID;

public record CareerMetricResponse(
    UUID id,
    String careerName,
    BigDecimal avgSalary,
    String jobDemand,
    String difficulty,
    String workLifeBalance,
    String growthRate
) {
}
