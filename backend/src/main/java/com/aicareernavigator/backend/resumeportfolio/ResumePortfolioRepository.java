package com.aicareernavigator.backend.resumeportfolio;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface ResumePortfolioRepository extends JpaRepository<ResumePortfolio, UUID> {

    List<ResumePortfolio> findByUserIdOrderByCreatedAtDesc(UUID userId);

    long countByUserId(UUID userId);

    long countByUserIdAndCreatedAtBetween(UUID userId, Instant start, Instant end);
}
