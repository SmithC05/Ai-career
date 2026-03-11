package com.aicareernavigator.backend.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

@Component
public class AiServiceClient {

    private final RestTemplate restTemplate;
    private final String aiServiceBaseUrl;

    public AiServiceClient(RestTemplate restTemplate,
                           @Value("${app.ai.base-url}") String aiServiceBaseUrl) {
        this.restTemplate = restTemplate;
        this.aiServiceBaseUrl = aiServiceBaseUrl;
    }

    public CareerAdviceResponse getCareerAdvice(CareerAdviceRequest request) {
        return post("/career-advice", request, CareerAdviceResponse.class);
    }

    public SkillGapAnalysisResponse analyzeSkillGap(SkillGapAnalysisRequest request) {
        return post("/skill-gap-analysis", request, SkillGapAnalysisResponse.class);
    }

    public RoadmapGeneratorResponse generateRoadmap(RoadmapGeneratorRequest request) {
        return post("/roadmap-generator", request, RoadmapGeneratorResponse.class);
    }

    public PersonalizedLearningPathResponse generatePersonalizedLearningPath(PersonalizedLearningPathRequest request) {
        return post("/personalized-learning-path", request, PersonalizedLearningPathResponse.class);
    }

    public ResumePortfolioBuilderResponse buildResumePortfolio(ResumePortfolioBuilderRequest request) {
        return post("/resume-portfolio-builder", request, ResumePortfolioBuilderResponse.class);
    }

    private <T> T post(String path, Object payload, Class<T> responseType) {
        try {
            T response = restTemplate.postForObject(aiServiceBaseUrl + path, payload, responseType);
            if (response == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Empty response from AI service");
            }
            return response;
        } catch (RestClientException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI service unavailable", ex);
        }
    }
}
