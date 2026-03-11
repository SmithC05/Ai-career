package com.aicareernavigator.backend.advisorchat;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AdvisorChatHistoryItem(
    UUID id,
    String question,
    String answer,
    List<String> suggestedCareers,
    List<String> nextSteps,
    Instant createdAt
) {
}
