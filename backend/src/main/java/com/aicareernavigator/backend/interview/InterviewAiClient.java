package com.aicareernavigator.backend.interview;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * HTTP client for the AI service Interview Assistant endpoints.
 * Follows the same RestTemplate pattern as AiServiceClient.
 */
@Component
public class InterviewAiClient {

    private final RestTemplate restTemplate;
    private final String aiServiceBaseUrl;

    public InterviewAiClient(RestTemplate restTemplate,
                             @Value("${app.ai.base-url}") String aiServiceBaseUrl) {
        this.restTemplate = restTemplate;
        this.aiServiceBaseUrl = aiServiceBaseUrl;
    }

    public List<InterviewQuestion> generateQuestions(String role, String difficulty, int count) {
        record Request(String role, String difficulty, int count) {}
        try {
            var resp = restTemplate.exchange(
                    aiServiceBaseUrl + "/ai/interview/questions",
                    HttpMethod.POST,
                    new org.springframework.http.HttpEntity<>(new Request(role, difficulty, count)),
                    new ParameterizedTypeReference<List<InterviewQuestion>>() {}
            );
            if (resp.getBody() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Empty response from AI service");
            }
            return resp.getBody();
        } catch (RestClientException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI service unavailable", ex);
        }
    }

    public InterviewFeedback evaluateAnswer(String question, String answer, String role) {
        record Request(String question, String answer, String role) {}
        try {
            InterviewFeedback response = restTemplate.postForObject(
                    aiServiceBaseUrl + "/ai/interview/evaluate",
                    new Request(question, answer, role),
                    InterviewFeedback.class);
            if (response == null) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Empty response from AI service");
            }
            return response;
        } catch (RestClientException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI service unavailable", ex);
        }
    }

    public List<InterviewQuestion> getQuestionBank(String role) {
        try {
            var resp = restTemplate.exchange(
                    aiServiceBaseUrl + "/ai/interview/bank/" + role,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<InterviewQuestion>>() {}
            );
            if (resp.getBody() == null) return List.of();
            return resp.getBody();
        } catch (RestClientException ex) {
            return List.of();
        }
    }
}
