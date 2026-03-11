package com.aicareernavigator.backend.career;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CareerRepository extends JpaRepository<Career, UUID> {

    List<Career> findAllByOrderByCareerNameAsc();

    Optional<Career> findByCareerNameIgnoreCase(String careerName);

    @EntityGraph(attributePaths = "skills")
    @Query("select c from Career c where c.id = :id")
    Optional<Career> findWithSkillsById(@Param("id") UUID id);
}
