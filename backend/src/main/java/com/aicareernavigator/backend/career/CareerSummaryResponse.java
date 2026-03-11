package com.aicareernavigator.backend.career;

import java.math.BigDecimal;
import java.util.UUID;

public record CareerSummaryResponse(
    UUID id,
    String careerName,
    BigDecimal avgSalary,
    String growthRate,
    String difficulty
) {
}
