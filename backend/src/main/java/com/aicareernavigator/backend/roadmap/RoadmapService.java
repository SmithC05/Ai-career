package com.aicareernavigator.backend.roadmap;

import com.aicareernavigator.backend.ai.AiServiceClient;
import com.aicareernavigator.backend.ai.RoadmapGeneratorRequest;
import com.aicareernavigator.backend.ai.RoadmapGeneratorResponse;
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
public class RoadmapService {

    private final RoadmapRepository roadmapRepository;
    private final UserRepository userRepository;
    private final CareerRepository careerRepository;
    private final AiServiceClient aiServiceClient;
    private final ObjectMapper objectMapper;

    public RoadmapService(RoadmapRepository roadmapRepository,
                          UserRepository userRepository,
                          CareerRepository careerRepository,
                          AiServiceClient aiServiceClient,
                          ObjectMapper objectMapper) {
        this.roadmapRepository = roadmapRepository;
        this.userRepository = userRepository;
        this.careerRepository = careerRepository;
        this.aiServiceClient = aiServiceClient;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public GenerateRoadmapResponse generateAndSave(String requesterEmail, RoadmapGeneratorRequest request) {
        AppUser user = userRepository.findByEmail(requesterEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        RoadmapGeneratorResponse generatedRoadmap = aiServiceClient.generateRoadmap(request);
        Career career = careerRepository.findByCareerNameIgnoreCase(request.targetCareer()).orElse(null);

        Roadmap roadmap = new Roadmap();
        roadmap.setUser(user);
        roadmap.setCareer(career);
        roadmap.setTitle("Learning roadmap for " + request.targetCareer());
        roadmap.setContent(toJson(generatedRoadmap));

        Roadmap saved = roadmapRepository.save(roadmap);
        return new GenerateRoadmapResponse(saved.getId(), generatedRoadmap);
    }

    @Transactional(readOnly = true)
    public List<RoadmapListItem> listUserRoadmaps(String requesterEmail) {
        AppUser user = userRepository.findByEmail(requesterEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        return roadmapRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream()
            .map(item -> new RoadmapListItem(item.getId(), item.getTitle(), item.getContent(), item.getCreatedAt()))
            .toList();
    }

    private String toJson(RoadmapGeneratorResponse generatedRoadmap) {
        try {
            return objectMapper.writeValueAsString(generatedRoadmap);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to serialize roadmap", ex);
        }
    }
}
