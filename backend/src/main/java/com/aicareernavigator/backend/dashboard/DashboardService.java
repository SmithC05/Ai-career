package com.aicareernavigator.backend.dashboard;

import com.aicareernavigator.backend.advisorchat.AdvisorChatRepository;
import com.aicareernavigator.backend.career.Career;
import com.aicareernavigator.backend.career.CareerRepository;
import com.aicareernavigator.backend.career.CareerSummaryResponse;
import com.aicareernavigator.backend.comparison.ComparisonRepository;
import com.aicareernavigator.backend.learningpath.LearningPathListItem;
import com.aicareernavigator.backend.learningpath.LearningPathRepository;
import com.aicareernavigator.backend.resumeportfolio.ResumePortfolioListItem;
import com.aicareernavigator.backend.resumeportfolio.ResumePortfolioRepository;
import com.aicareernavigator.backend.roadmap.RoadmapListItem;
import com.aicareernavigator.backend.roadmap.RoadmapRepository;
import com.aicareernavigator.backend.savedcareer.SavedCareer;
import com.aicareernavigator.backend.savedcareer.SavedCareerRepository;
import com.aicareernavigator.backend.user.AppUser;
import com.aicareernavigator.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final CareerRepository careerRepository;
    private final SavedCareerRepository savedCareerRepository;
    private final RoadmapRepository roadmapRepository;
    private final LearningPathRepository learningPathRepository;
    private final ResumePortfolioRepository resumePortfolioRepository;
    private final ComparisonRepository comparisonRepository;
    private final AdvisorChatRepository advisorChatRepository;

    public DashboardService(UserRepository userRepository,
                            CareerRepository careerRepository,
                            SavedCareerRepository savedCareerRepository,
                            RoadmapRepository roadmapRepository,
                            LearningPathRepository learningPathRepository,
                            ResumePortfolioRepository resumePortfolioRepository,
                            ComparisonRepository comparisonRepository,
                            AdvisorChatRepository advisorChatRepository) {
        this.userRepository = userRepository;
        this.careerRepository = careerRepository;
        this.savedCareerRepository = savedCareerRepository;
        this.roadmapRepository = roadmapRepository;
        this.learningPathRepository = learningPathRepository;
        this.resumePortfolioRepository = resumePortfolioRepository;
        this.comparisonRepository = comparisonRepository;
        this.advisorChatRepository = advisorChatRepository;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(String requesterEmail) {
        AppUser user = resolveUser(requesterEmail);

        List<CareerSummaryResponse> savedCareers = savedCareerRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream()
            .map(SavedCareer::getCareer)
            .map(this::toSummary)
            .toList();

        List<RoadmapListItem> roadmaps = roadmapRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream()
            .map(r -> new RoadmapListItem(r.getId(), r.getTitle(), r.getContent(), r.getCreatedAt()))
            .toList();

        List<LearningPathListItem> learningPaths = learningPathRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream()
            .map(lp -> new LearningPathListItem(lp.getId(), lp.getTitle(), lp.getContent(), lp.getCreatedAt()))
            .toList();

        List<ResumePortfolioListItem> resumePortfolios = resumePortfolioRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream()
            .map(item -> new ResumePortfolioListItem(
                item.getId(),
                item.getTitle(),
                item.getTargetCareer(),
                item.getContent(),
                item.getCreatedAt()
            ))
            .toList();

        List<CareerSummaryResponse> recommendations = careerRepository.findAll()
            .stream()
            .sorted(Comparator.comparing(Career::getAvgSalary).reversed())
            .limit(3)
            .map(this::toSummary)
            .toList();

        DashboardAnalyticsResponse analytics = buildAnalytics(user.getId());

        return new DashboardResponse(savedCareers, roadmaps, learningPaths, resumePortfolios, recommendations, analytics);
    }

    @Transactional
    public void saveCareer(String requesterEmail, UUID careerId) {
        AppUser user = resolveUser(requesterEmail);
        Career career = careerRepository.findById(careerId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Career not found"));

        if (savedCareerRepository.existsByUserIdAndCareerId(user.getId(), careerId)) {
            return;
        }

        SavedCareer savedCareer = new SavedCareer();
        savedCareer.setUser(user);
        savedCareer.setCareer(career);
        savedCareerRepository.save(savedCareer);
    }

    @Transactional
    public void removeSavedCareer(String requesterEmail, UUID careerId) {
        AppUser user = resolveUser(requesterEmail);
        savedCareerRepository.deleteByUserIdAndCareerId(user.getId(), careerId);
    }

    private AppUser resolveUser(String requesterEmail) {
        return userRepository.findByEmail(requesterEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
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

    private DashboardAnalyticsResponse buildAnalytics(UUID userId) {
        long savedCareerCount = savedCareerRepository.countByUserId(userId);
        long roadmapCount = roadmapRepository.countByUserId(userId);
        long learningPathCount = learningPathRepository.countByUserId(userId);
        long resumePortfolioCount = resumePortfolioRepository.countByUserId(userId);
        long comparisonCount = comparisonRepository.countByUserId(userId);
        long advisorCount = advisorChatRepository.countByUserId(userId);

        int totalMilestones = 6;
        int completedMilestones = 0;
        if (savedCareerCount > 0) {
            completedMilestones++;
        }
        if (comparisonCount > 0) {
            completedMilestones++;
        }
        if (advisorCount > 0) {
            completedMilestones++;
        }
        if (roadmapCount > 0) {
            completedMilestones++;
        }
        if (learningPathCount > 0) {
            completedMilestones++;
        }
        if (resumePortfolioCount > 0) {
            completedMilestones++;
        }

        int completionScore = (int) Math.round((completedMilestones * 100.0) / totalMilestones);

        Instant now = Instant.now();
        Instant currentWeekStart = now.minus(7, ChronoUnit.DAYS);
        Instant previousWeekStart = now.minus(14, ChronoUnit.DAYS);

        int weeklyProgress = (int) (
            savedCareerRepository.countByUserIdAndCreatedAtBetween(userId, currentWeekStart, now)
                + roadmapRepository.countByUserIdAndCreatedAtBetween(userId, currentWeekStart, now)
                + learningPathRepository.countByUserIdAndCreatedAtBetween(userId, currentWeekStart, now)
                + resumePortfolioRepository.countByUserIdAndCreatedAtBetween(userId, currentWeekStart, now)
                + comparisonRepository.countByUserIdAndCreatedAtBetween(userId, currentWeekStart, now)
                + advisorChatRepository.countByUserIdAndCreatedAtBetween(userId, currentWeekStart, now)
        );

        int previousWeekProgress = (int) (
            savedCareerRepository.countByUserIdAndCreatedAtBetween(userId, previousWeekStart, currentWeekStart)
                + roadmapRepository.countByUserIdAndCreatedAtBetween(userId, previousWeekStart, currentWeekStart)
                + learningPathRepository.countByUserIdAndCreatedAtBetween(userId, previousWeekStart, currentWeekStart)
                + resumePortfolioRepository.countByUserIdAndCreatedAtBetween(userId, previousWeekStart, currentWeekStart)
                + comparisonRepository.countByUserIdAndCreatedAtBetween(userId, previousWeekStart, currentWeekStart)
                + advisorChatRepository.countByUserIdAndCreatedAtBetween(userId, previousWeekStart, currentWeekStart)
        );

        double trendPercentage = previousWeekProgress == 0
            ? (weeklyProgress > 0 ? 100.0 : 0.0)
            : ((weeklyProgress - previousWeekProgress) * 100.0) / previousWeekProgress;

        String trendDirection = weeklyProgress > previousWeekProgress
            ? "UP"
            : (weeklyProgress < previousWeekProgress ? "DOWN" : "STABLE");

        int weeklyTarget = 8;

        return new DashboardAnalyticsResponse(
            completionScore,
            completedMilestones,
            totalMilestones,
            weeklyTarget,
            weeklyProgress,
            previousWeekProgress,
            Math.round(trendPercentage * 10.0) / 10.0,
            trendDirection
        );
    }
}
