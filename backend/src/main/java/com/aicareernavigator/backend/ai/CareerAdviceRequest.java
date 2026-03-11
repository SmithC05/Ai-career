package com.aicareernavigator.backend.ai;

import jakarta.validation.constraints.NotBlank;

public record CareerAdviceRequest(
    @NotBlank(message = "Question is required")
    String question
) {
}
