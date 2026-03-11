package com.aicareernavigator.backend.ai;

import java.util.List;

public record ResumeSection(
    String heading,
    List<String> bullets
) {
}
