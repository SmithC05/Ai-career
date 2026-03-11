package com.aicareernavigator.backend.resumeportfolio;

import com.aicareernavigator.backend.ai.AiServiceClient;
import com.aicareernavigator.backend.ai.ResumePortfolioBuilderRequest;
import com.aicareernavigator.backend.ai.ResumePortfolioBuilderResponse;
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
public class ResumePortfolioService {

    private final ResumePortfolioRepository resumePortfolioRepository;
    private final UserRepository userRepository;
    private final AiServiceClient aiServiceClient;
    private final ObjectMapper objectMapper;

    public ResumePortfolioService(ResumePortfolioRepository resumePortfolioRepository,
                                  UserRepository userRepository,
                                  AiServiceClient aiServiceClient,
                                  ObjectMapper objectMapper) {
        this.resumePortfolioRepository = resumePortfolioRepository;
        this.userRepository = userRepository;
        this.aiServiceClient = aiServiceClient;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public GenerateResumePortfolioResponse generateAndSave(String requesterEmail, ResumePortfolioBuilderRequest request) {
        AppUser user = userRepository.findByEmail(requesterEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        ResumePortfolioBuilderResponse generated = aiServiceClient.buildResumePortfolio(request);

        ResumePortfolio item = new ResumePortfolio();
        item.setUser(user);
        item.setTargetCareer(request.targetCareer());
        item.setTitle("Resume + portfolio pack for " + request.targetCareer());
        item.setContent(toJson(generated));

        ResumePortfolio saved = resumePortfolioRepository.save(item);
        return new GenerateResumePortfolioResponse(saved.getId(), generated);
    }

    @Transactional(readOnly = true)
    public List<ResumePortfolioListItem> listUserItems(String requesterEmail) {
        AppUser user = userRepository.findByEmail(requesterEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        return resumePortfolioRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream()
            .map(item -> new ResumePortfolioListItem(
                item.getId(),
                item.getTitle(),
                item.getTargetCareer(),
                item.getContent(),
                item.getCreatedAt()
            ))
            .toList();
    }

    private String toJson(ResumePortfolioBuilderResponse generated) {
        try {
            return objectMapper.writeValueAsString(generated);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to serialize resume output", ex);
        }
    }
}
