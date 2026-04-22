package com.aicareernavigator.backend.resume;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysisEntity, UUID> {

    List<ResumeAnalysisEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<ResumeAnalysisEntity> findByIdAndUserId(UUID id, UUID userId);
}
