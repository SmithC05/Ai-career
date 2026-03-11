package com.aicareernavigator.backend.career;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CareerDetailResponse(
    UUID id,
    String careerName,
    String description,
    BigDecimal avgSalary,
    String jobSecurity,
    String growthRate,
    String difficulty,
    String jobDemand,
    String workLifeBalance,
    List<String> requiredSkills
) {
}
