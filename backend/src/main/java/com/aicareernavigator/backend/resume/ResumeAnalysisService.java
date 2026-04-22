package com.aicareernavigator.backend.resume;

import com.aicareernavigator.backend.user.AppUser;
import com.aicareernavigator.backend.user.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class ResumeAnalysisService {

    private static final int MAX_TEXT_CHARS = 8000;

    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final UserRepository userRepository;
    private final ResumeAiClient resumeAiClient;
    private final ObjectMapper objectMapper;

    public ResumeAnalysisService(ResumeAnalysisRepository resumeAnalysisRepository,
                                 UserRepository userRepository,
                                 ResumeAiClient resumeAiClient,
                                 ObjectMapper objectMapper) {
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.userRepository = userRepository;
        this.resumeAiClient = resumeAiClient;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public ResumeAnalysisDto analyseResume(String requesterEmail,
                                           MultipartFile pdfFile,
                                           String jobDescription) {
        AppUser user = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        String rawText = extractPdfText(pdfFile);

        ResumeAnalyseRequest aiRequest = new ResumeAnalyseRequest(
                rawText.length() > MAX_TEXT_CHARS ? rawText.substring(0, MAX_TEXT_CHARS) : rawText,
                jobDescription != null ? jobDescription : ""
        );

        ResumeAnalyseResponse aiResponse = resumeAiClient.analyseResume(aiRequest);

        ResumeAnalysisEntity entity = new ResumeAnalysisEntity();
        entity.setUser(user);
        entity.setRawText(rawText);
        entity.setExtractedSkills(toJson(aiResponse.extractedSkills()));
        entity.setJobDescription(jobDescription);
        entity.setMatchScore(aiResponse.matchScore());
        entity.setSuggestions(toJson(aiResponse.suggestions()));

        ResumeAnalysisEntity saved = resumeAnalysisRepository.save(entity);
        return toDto(saved, aiResponse);
    }

    @Transactional(readOnly = true)
    public ResumeAnalysisDto getById(String requesterEmail, UUID id) {
        AppUser user = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        ResumeAnalysisEntity entity = resumeAnalysisRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Analysis not found"));

        List<String> skills = fromJson(entity.getExtractedSkills());
        List<String> suggestions = fromJson(entity.getSuggestions());

        return new ResumeAnalysisDto(
                entity.getId(),
                skills,
                entity.getJobDescription(),
                entity.getMatchScore() != null ? entity.getMatchScore() : 0,
                suggestions,
                List.of(),
                entity.getCreatedAt()
        );
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private String extractPdfText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PDF file is required");
        }
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(doc).trim();
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read PDF file", ex);
        }
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Serialization error", ex);
        }
    }

    private List<String> fromJson(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException ex) {
            return List.of();
        }
    }

    private ResumeAnalysisDto toDto(ResumeAnalysisEntity entity, ResumeAnalyseResponse ai) {
        return new ResumeAnalysisDto(
                entity.getId(),
                ai.extractedSkills() != null ? ai.extractedSkills() : List.of(),
                entity.getJobDescription(),
                ai.matchScore(),
                ai.suggestions() != null ? ai.suggestions() : List.of(),
                ai.improvementAreas() != null ? ai.improvementAreas() : List.of(),
                entity.getCreatedAt()
        );
    }
}
