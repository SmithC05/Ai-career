package com.aicareernavigator.backend.interview;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InterviewSessionRepository extends JpaRepository<InterviewSessionEntity, UUID> {

    List<InterviewSessionEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<InterviewSessionEntity> findByIdAndUserId(UUID id, UUID userId);
}
