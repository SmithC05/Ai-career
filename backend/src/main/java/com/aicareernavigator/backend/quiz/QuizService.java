package com.aicareernavigator.backend.quiz;

import com.aicareernavigator.backend.career.Career;
import com.aicareernavigator.backend.career.CareerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
public class QuizService {

    private enum QuizTrack {
        DATA_SCIENCE,
        SOFTWARE_ENGINEERING,
        CYBERSECURITY,
        UI_UX,
        DIGITAL_MARKETING,
        PRODUCT_MANAGEMENT
    }

    private static final Map<String, List<QuizTrack>> OPTION_TRACKS = Map.ofEntries(
        Map.entry("interest_data", List.of(QuizTrack.DATA_SCIENCE)),
        Map.entry("interest_build", List.of(QuizTrack.SOFTWARE_ENGINEERING)),
        Map.entry("interest_security", List.of(QuizTrack.CYBERSECURITY)),
        Map.entry("interest_design", List.of(QuizTrack.UI_UX)),
        Map.entry("interest_growth", List.of(QuizTrack.DIGITAL_MARKETING, QuizTrack.PRODUCT_MANAGEMENT)),
        Map.entry("interest_strategy", List.of(QuizTrack.PRODUCT_MANAGEMENT)),

        Map.entry("work_research", List.of(QuizTrack.DATA_SCIENCE, QuizTrack.UI_UX)),
        Map.entry("work_coding", List.of(QuizTrack.SOFTWARE_ENGINEERING)),
        Map.entry("work_risk", List.of(QuizTrack.CYBERSECURITY)),
        Map.entry("work_storytelling", List.of(QuizTrack.DIGITAL_MARKETING, QuizTrack.PRODUCT_MANAGEMENT)),

        Map.entry("tool_python", List.of(QuizTrack.DATA_SCIENCE)),
        Map.entry("tool_web", List.of(QuizTrack.SOFTWARE_ENGINEERING)),
        Map.entry("tool_security", List.of(QuizTrack.CYBERSECURITY)),
        Map.entry("tool_design", List.of(QuizTrack.UI_UX)),
        Map.entry("tool_ads", List.of(QuizTrack.DIGITAL_MARKETING)),
        Map.entry("tool_pm", List.of(QuizTrack.PRODUCT_MANAGEMENT)),

        Map.entry("impact_insights", List.of(QuizTrack.DATA_SCIENCE)),
        Map.entry("impact_product", List.of(QuizTrack.SOFTWARE_ENGINEERING, QuizTrack.PRODUCT_MANAGEMENT)),
        Map.entry("impact_safety", List.of(QuizTrack.CYBERSECURITY)),
        Map.entry("impact_usability", List.of(QuizTrack.UI_UX)),
        Map.entry("impact_growth", List.of(QuizTrack.DIGITAL_MARKETING, QuizTrack.PRODUCT_MANAGEMENT))
    );

    private final CareerRepository careerRepository;

    public QuizService(CareerRepository careerRepository) {
        this.careerRepository = careerRepository;
    }

    @Transactional(readOnly = true)
    public QuizSubmitResponse submitQuiz(Map<String, String> answers) {
        List<Career> careers = careerRepository.findAllWithSkillsOrderByCareerNameAsc();
        if (careers.isEmpty()) {
            return new QuizSubmitResponse(List.of(), Instant.now());
        }

        Map<QuizTrack, Integer> trackScores = initScores();
        for (String selectedOptionId : answers.values()) {
            List<QuizTrack> mappedTracks = OPTION_TRACKS.getOrDefault(selectedOptionId, List.of());
            for (QuizTrack track : mappedTracks) {
                trackScores.merge(track, 1, (a, b) -> a + b);
            }
        }

        boolean hasAnswers = !answers.isEmpty();
        int maxScore = Math.max(trackScores.values().stream().max(Integer::compareTo).orElse(0), 1);

        List<ScoredCareer> ranked = careers.stream()
            .map(career -> toScoredCareer(career, trackScores, maxScore, hasAnswers))
            .sorted(
                Comparator.comparingInt(ScoredCareer::rawScore).reversed()
                    .thenComparing((ScoredCareer item) -> item.career().getAvgSalary()).reversed()
            )
            .limit(3)
            .toList();

        List<QuizRecommendationResponse> recommendations = ranked.stream()
            .map(ScoredCareer::response)
            .toList();

        return new QuizSubmitResponse(recommendations, Instant.now());
    }

    private Map<QuizTrack, Integer> initScores() {
        Map<QuizTrack, Integer> scores = new EnumMap<>(QuizTrack.class);
        for (QuizTrack track : QuizTrack.values()) {
            scores.put(track, 0);
        }
        return scores;
    }

    private ScoredCareer toScoredCareer(
        Career career,
        Map<QuizTrack, Integer> trackScores,
        int maxScore,
        boolean hasAnswers
    ) {
        QuizTrack track = inferTrack(career.getCareerName());
        int rawScore = track != null ? trackScores.getOrDefault(track, 0) : 0;

        int matchPercentage;
        if (hasAnswers) {
            int normalized = Math.round((rawScore / (float) maxScore) * 100);
            matchPercentage = Math.min(97, Math.max(55, normalized));
        } else {
            matchPercentage = 70;
        }

        List<String> strengths = career.getSkills().stream()
            .map(skill -> skill.getSkillName())
            .sorted()
            .limit(3)
            .toList();

        if (strengths.isEmpty()) {
            strengths = List.of("Problem solving", "Communication", "Practical execution");
        }

        QuizRecommendationResponse response = new QuizRecommendationResponse(
            career.getId(),
            career.getCareerName(),
            career.getDescription(),
            inferCategory(career.getCareerName()),
            matchPercentage,
            strengths
        );

        return new ScoredCareer(career, rawScore, response);
    }

    private QuizTrack inferTrack(String careerName) {
        String normalized = careerName.toLowerCase();
        if (normalized.contains("data")) {
            return QuizTrack.DATA_SCIENCE;
        }
        if (normalized.contains("software")) {
            return QuizTrack.SOFTWARE_ENGINEERING;
        }
        if (normalized.contains("cyber")) {
            return QuizTrack.CYBERSECURITY;
        }
        if (normalized.contains("ui") || normalized.contains("ux") || normalized.contains("design")) {
            return QuizTrack.UI_UX;
        }
        if (normalized.contains("product")) {
            return QuizTrack.PRODUCT_MANAGEMENT;
        }
        return null;
    }

    private String inferCategory(String careerName) {
        String normalized = careerName.toLowerCase();
        if (normalized.contains("design")) {
            return "Design";
        }
        if (normalized.contains("product") || normalized.contains("marketing")) {
            return "Business";
        }
        return "Technology";
    }

    private record ScoredCareer(Career career, int rawScore, QuizRecommendationResponse response) {}
}
