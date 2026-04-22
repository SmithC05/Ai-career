package com.aicareernavigator.backend.resume;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

/**
 * HTTP client for the AI service Resume Analyser endpoints.
 * Follows the same RestTemplate pattern as AiServiceClient.
 */
@Component
public class ResumeAiClient {

    private final RestTemplate restTemplate;
    private final String aiServiceBaseUrl;

    public ResumeAiClient(RestTemplate restTemplate,
                          @Value("${app.ai.base-url}") String aiServiceBaseUrl) {
        this.restTemplate = restTemplate;
        this.aiServiceBaseUrl = aiServiceBaseUrl;
    }

    public ResumeAnalyseResponse analyseResume(ResumeAnalyseRequest request) {
        try {
            ResumeAnalyseResponse response = restTemplate.postForObject(
                    aiServiceBaseUrl + "/ai/resume/analyse", request, ResumeAnalyseResponse.class);
            if (response == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Empty response from AI service");
            }
            return response;
        } catch (RestClientException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI service unavailable", ex);
        }
    }
}
