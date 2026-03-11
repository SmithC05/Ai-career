package com.aicareernavigator.backend.ai;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record ResumePortfolioBuilderRequest(
    @NotBlank(message = "Target career is required")
    String targetCareer,

    @NotBlank(message = "Full name is required")
    String fullName,

    @NotBlank(message = "Education is required")
    String education,

    List<String> skills,
    List<String> projects,
    List<String> achievements,
    List<String> experiences,
    List<String> links
) {
}
