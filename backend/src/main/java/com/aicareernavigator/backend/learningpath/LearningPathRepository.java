package com.aicareernavigator.backend.learningpath;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface LearningPathRepository extends JpaRepository<LearningPath, UUID> {

    List<LearningPath> findByUserIdOrderByCreatedAtDesc(UUID userId);

    long countByUserId(UUID userId);

    long countByUserIdAndCreatedAtBetween(UUID userId, Instant start, Instant end);
}
