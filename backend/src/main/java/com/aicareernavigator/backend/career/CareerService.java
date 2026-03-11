package com.aicareernavigator.backend.career;

import com.aicareernavigator.backend.comparison.Comparison;
import com.aicareernavigator.backend.comparison.ComparisonRepository;
import com.aicareernavigator.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class CareerService {

    private final CareerRepository careerRepository;
    private final UserRepository userRepository;
    private final ComparisonRepository comparisonRepository;

    public CareerService(CareerRepository careerRepository,
                         UserRepository userRepository,
                         ComparisonRepository comparisonRepository) {
        this.careerRepository = careerRepository;
        this.userRepository = userRepository;
        this.comparisonRepository = comparisonRepository;
    }

    @Transactional(readOnly = true)
    public List<CareerSummaryResponse> listCareers() {
        return careerRepository.findAllByOrderByCareerNameAsc()
            .stream()
            .map(this::toSummary)
            .toList();
    }

    @Transactional(readOnly = true)
    public CareerDetailResponse getCareerById(UUID careerId) {
        Career career = careerRepository.findWithSkillsById(careerId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Career not found"));

        return new CareerDetailResponse(
            career.getId(),
            career.getCareerName(),
            career.getDescription(),
            career.getAvgSalary(),
            career.getJobSecurity(),
            career.getGrowthRate(),
            career.getDifficulty(),
            career.getJobDemand(),
            career.getWorkLifeBalance(),
            career.getSkills().stream().map(s -> s.getSkillName()).sorted().toList()
        );
    }

    @Transactional
    public CareerComparisonResponse compareCareers(UUID careerAId, UUID careerBId, String requesterEmail) {
        if (careerAId.equals(careerBId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose two different careers for comparison");
        }

        Career careerA = careerRepository.findById(careerAId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Career A not found"));
        Career careerB = careerRepository.findById(careerBId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Career B not found"));

        String summary = buildSummary(careerA, careerB);
        maybePersistComparison(careerA, careerB, summary, requesterEmail);

        return new CareerComparisonResponse(toMetrics(careerA), toMetrics(careerB), summary);
    }

    private void maybePersistComparison(Career careerA, Career careerB, String summary, String requesterEmail) {
        if (requesterEmail == null || requesterEmail.isBlank()) {
            return;
        }

        userRepository.findByEmail(requesterEmail).ifPresent(user -> {
            Comparison comparison = new Comparison();
            comparison.setUser(user);
            comparison.setCareerA(careerA);
            comparison.setCareerB(careerB);
            comparison.setSummary(summary);
            comparisonRepository.save(comparison);
        });
    }

    private CareerSummaryResponse toSummary(Career career) {
        return new CareerSummaryResponse(
            career.getId(),
            career.getCareerName(),
            career.getAvgSalary(),
            career.getGrowthRate(),
            career.getDifficulty()
        );
    }

    private CareerMetricResponse toMetrics(Career career) {
        return new CareerMetricResponse(
            career.getId(),
            career.getCareerName(),
            career.getAvgSalary(),
            career.getJobDemand(),
            career.getDifficulty(),
            career.getWorkLifeBalance(),
            career.getGrowthRate()
        );
    }

    private String buildSummary(Career a, Career b) {
        String salaryLeader = a.getAvgSalary().compareTo(b.getAvgSalary()) >= 0 ? a.getCareerName() : b.getCareerName();
        String easierPath = difficultyScore(a.getDifficulty()) <= difficultyScore(b.getDifficulty())
            ? a.getCareerName()
            : b.getCareerName();

        return salaryLeader + " has stronger salary potential, while " + easierPath
            + " appears to have the lower entry difficulty. Use job demand and work-life balance to finalize your decision.";
    }

    private int difficultyScore(String difficulty) {
        if (difficulty == null) {
            return 2;
        }
        return switch (difficulty.toLowerCase()) {
            case "beginner", "low", "easy" -> 1;
            case "advanced", "hard", "high" -> 3;
            default -> 2;
        };
    }
}
