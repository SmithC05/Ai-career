package com.aicareernavigator.backend.quiz;

import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record QuizSubmitRequest(
    @NotNull Map<String, String> answers
) {
}
