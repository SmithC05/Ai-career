package com.aicareernavigator.backend.savedcareer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface SavedCareerRepository extends JpaRepository<SavedCareer, UUID> {

    List<SavedCareer> findByUserIdOrderByCreatedAtDesc(UUID userId);

    boolean existsByUserIdAndCareerId(UUID userId, UUID careerId);

    void deleteByUserIdAndCareerId(UUID userId, UUID careerId);

    long countByUserId(UUID userId);

    long countByUserIdAndCreatedAtBetween(UUID userId, Instant start, Instant end);
}
