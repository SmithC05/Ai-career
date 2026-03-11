package com.aicareernavigator.backend.ai;

import com.aicareernavigator.backend.advisorchat.AdvisorChatHistoryItem;
import com.aicareernavigator.backend.advisorchat.AdvisorChatService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ai")
public class AiController {

    private final AiServiceClient aiServiceClient;
    private final AdvisorChatService advisorChatService;

    public AiController(AiServiceClient aiServiceClient, AdvisorChatService advisorChatService) {
        this.aiServiceClient = aiServiceClient;
        this.advisorChatService = advisorChatService;
    }

    @PostMapping("/career-advice")
    public CareerAdviceResponse careerAdvice(Authentication authentication, @Valid @RequestBody CareerAdviceRequest request) {
        CareerAdviceResponse response = aiServiceClient.getCareerAdvice(request);
        advisorChatService.saveAdvice(authentication.getName(), request.question(), response);
        return response;
    }

    @PostMapping("/skill-gap-analysis")
    public SkillGapAnalysisResponse skillGapAnalysis(@Valid @RequestBody SkillGapAnalysisRequest request) {
        return aiServiceClient.analyzeSkillGap(request);
    }

    @PostMapping("/roadmap-generator")
    public RoadmapGeneratorResponse roadmapGenerator(@Valid @RequestBody RoadmapGeneratorRequest request) {
        return aiServiceClient.generateRoadmap(request);
    }

    @GetMapping("/chat-history")
    public List<AdvisorChatHistoryItem> chatHistory(Authentication authentication) {
        return advisorChatService.getHistory(authentication.getName());
    }
}
