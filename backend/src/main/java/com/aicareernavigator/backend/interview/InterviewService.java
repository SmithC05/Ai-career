package com.aicareernavigator.backend.interview;

import com.aicareernavigator.backend.user.AppUser;
import com.aicareernavigator.backend.user.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class InterviewService {

    private static final int DEFAULT_QUESTION_COUNT = 5;

    private final InterviewSessionRepository interviewSessionRepository;
    private final UserRepository userRepository;
    private final InterviewAiClient interviewAiClient;
    private final ObjectMapper objectMapper;

    public InterviewService(InterviewSessionRepository interviewSessionRepository,
                            UserRepository userRepository,
                            InterviewAiClient interviewAiClient,
                            ObjectMapper objectMapper) {
        this.interviewSessionRepository = interviewSessionRepository;
        this.userRepository = userRepository;
        this.interviewAiClient = interviewAiClient;
        this.objectMapper = objectMapper;
    }

    /** POST /api/v1/interview/start — creates a new session with generated questions. */
    @Transactional
    public InterviewSessionDto startSession(String requesterEmail, String role, String difficulty) {
        AppUser user = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        List<InterviewQuestion> questions = interviewAiClient.generateQuestions(
                role, difficulty, DEFAULT_QUESTION_COUNT);

        InterviewSessionEntity entity = new InterviewSessionEntity();
        entity.setUser(user);
        entity.setTargetRole(role);
        entity.setDifficulty(difficulty != null ? difficulty : "medium");
        entity.setQuestions(toJson(questions));
        entity.setAnswers(toJson(List.of()));
        entity.setFeedback(toJson(List.of()));

        InterviewSessionEntity saved = interviewSessionRepository.save(entity);
        return buildDto(saved, questions, List.of(), List.of());
    }

    /** POST /api/v1/interview/evaluate — adds an answer+feedback to an existing session. */
    @Transactional
    public InterviewFeedback evaluateAnswer(String requesterEmail,
                                            UUID sessionId,
                                            int questionIndex,
                                            String answer) {
        AppUser user = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        InterviewSessionEntity entity = interviewSessionRepository.findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        List<InterviewQuestion> questions = fromJsonQuestions(entity.getQuestions());
        if (questionIndex < 0 || questionIndex >= questions.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid question index");
        }

        String questionText = questions.get(questionIndex).question();
        InterviewFeedback feedback = interviewAiClient.evaluateAnswer(
                questionText, answer, entity.getTargetRole());

        // Merge answer and feedback into existing lists
        List<String> answers = new ArrayList<>(fromJsonStrings(entity.getAnswers()));
        List<InterviewFeedback> feedbackList = new ArrayList<>(fromJsonFeedback(entity.getFeedback()));

        // Pad lists to current index if needed
        while (answers.size() <= questionIndex) answers.add("");
        while (feedbackList.size() <= questionIndex) feedbackList.add(null);

        answers.set(questionIndex, answer);
        feedbackList.set(questionIndex, feedback);

        entity.setAnswers(toJson(answers));
        entity.setFeedback(toJson(feedbackList));
        interviewSessionRepository.save(entity);

        return feedback;
    }

    /** GET /api/v1/interview/sessions/{id} */
    @Transactional(readOnly = true)
    public InterviewSessionDto getSession(String requesterEmail, UUID id) {
        AppUser user = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        InterviewSessionEntity entity = interviewSessionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        return buildDto(
                entity,
                fromJsonQuestions(entity.getQuestions()),
                fromJsonStrings(entity.getAnswers()),
                fromJsonFeedback(entity.getFeedback())
        );
    }

    /** GET /api/v1/interview/sessions */
    @Transactional(readOnly = true)
    public List<InterviewSessionListItem> listSessions(String requesterEmail) {
        AppUser user = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        return interviewSessionRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(e -> new InterviewSessionListItem(
                        e.getId(), e.getTargetRole(), e.getDifficulty(), e.getCreatedAt()))
                .toList();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private InterviewSessionDto buildDto(InterviewSessionEntity entity,
                                         List<InterviewQuestion> questions,
                                         List<String> answers,
                                         List<InterviewFeedback> feedback) {
        return new InterviewSessionDto(
                entity.getId(),
                entity.getTargetRole(),
                entity.getDifficulty(),
                questions,
                answers,
                feedback,
                entity.getCreatedAt()
        );
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Serialization error", ex);
        }
    }

    private List<InterviewQuestion> fromJsonQuestions(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<List<InterviewQuestion>>() {});
        } catch (JsonProcessingException ex) {
            return List.of();
        }
    }

    private List<String> fromJsonStrings(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException ex) {
            return new ArrayList<>();
        }
    }

    private List<InterviewFeedback> fromJsonFeedback(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<InterviewFeedback>>() {});
        } catch (JsonProcessingException ex) {
            return new ArrayList<>();
        }
    }
}
