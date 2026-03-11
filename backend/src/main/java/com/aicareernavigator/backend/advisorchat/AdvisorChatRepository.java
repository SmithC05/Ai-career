package com.aicareernavigator.backend.advisorchat;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface AdvisorChatRepository extends JpaRepository<AdvisorChat, UUID> {

    List<AdvisorChat> findByUserIdOrderByCreatedAtDesc(UUID userId);

    long countByUserId(UUID userId);

    long countByUserIdAndCreatedAtBetween(UUID userId, Instant start, Instant end);
}
