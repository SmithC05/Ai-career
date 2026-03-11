package com.aicareernavigator.backend.learningpath;

import com.aicareernavigator.backend.ai.AiServiceClient;
import com.aicareernavigator.backend.ai.PersonalizedLearningPathRequest;
import com.aicareernavigator.backend.ai.PersonalizedLearningPathResponse;
import com.aicareernavigator.backend.career.Career;
import com.aicareernavigator.backend.career.CareerRepository;
import com.aicareernavigator.backend.user.AppUser;
import com.aicareernavigator.backend.user.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class LearningPathService {

    private final LearningPathRepository learningPathRepository;
    private final UserRepository userRepository;
    private final CareerRepository careerRepository;
    private final AiServiceClient aiServiceClient;
    private final ObjectMapper objectMapper;

    public LearningPathService(LearningPathRepository learningPathRepository,
                               UserRepository userRepository,
                               CareerRepository careerRepository,
                               AiServiceClient aiServiceClient,
                               ObjectMapper objectMapper) {
        this.learningPathRepository = learningPathRepository;
        this.userRepository = userRepository;
        this.careerRepository = careerRepository;
        this.aiServiceClient = aiServiceClient;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public GenerateLearningPathResponse generateAndSave(String requesterEmail, PersonalizedLearningPathRequest request) {
        AppUser user = userRepository.findByEmail(requesterEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        PersonalizedLearningPathResponse generatedPath = aiServiceClient.generatePersonalizedLearningPath(request);
        Career career = careerRepository.findByCareerNameIgnoreCase(request.targetCareer()).orElse(null);

        LearningPath path = new LearningPath();
        path.setUser(user);
        path.setCareer(career);
        path.setTitle("Personalized learning path for " + request.targetCareer());
        path.setContent(toJson(generatedPath));

        LearningPath saved = learningPathRepository.save(path);
        return new GenerateLearningPathResponse(saved.getId(), generatedPath);
    }

    @Transactional(readOnly = true)
    public List<LearningPathListItem> listUserLearningPaths(String requesterEmail) {
        AppUser user = userRepository.findByEmail(requesterEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        return learningPathRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream()
            .map(item -> new LearningPathListItem(item.getId(), item.getTitle(), item.getContent(), item.getCreatedAt()))
            .toList();
    }

    private String toJson(PersonalizedLearningPathResponse generatedPath) {
        try {
            return objectMapper.writeValueAsString(generatedPath);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to serialize learning path", ex);
        }
    }
}
