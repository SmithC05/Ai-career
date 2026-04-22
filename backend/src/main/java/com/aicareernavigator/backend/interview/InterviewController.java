package com.aicareernavigator.backend.interview;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/interview")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    /** POST /api/v1/interview/start — body: { role, difficulty } */
    @PostMapping("/start")
    public InterviewSessionDto start(Authentication authentication,
                                     @Valid @RequestBody StartRequest request) {
        return interviewService.startSession(
                authentication.getName(), request.role(), request.difficulty());
    }

    /** POST /api/v1/interview/evaluate — body: { sessionId, questionIndex, answer } */
    @PostMapping("/evaluate")
    public InterviewFeedback evaluate(Authentication authentication,
                                      @Valid @RequestBody EvaluateRequest request) {
        return interviewService.evaluateAnswer(
                authentication.getName(), request.sessionId(),
                request.questionIndex(), request.answer());
    }

    /** GET /api/v1/interview/sessions */
    @GetMapping("/sessions")
    public List<InterviewSessionListItem> listSessions(Authentication authentication) {
        return interviewService.listSessions(authentication.getName());
    }

    /** GET /api/v1/interview/sessions/{id} */
    @GetMapping("/sessions/{id}")
    public InterviewSessionDto getSession(Authentication authentication,
                                          @PathVariable UUID id) {
        return interviewService.getSession(authentication.getName(), id);
    }

    // ── Request records ───────────────────────────────────────────────────────

    record StartRequest(
            @NotBlank String role,
            String difficulty
    ) {}

    record EvaluateRequest(
            @NotNull UUID sessionId,
            @Min(0) int questionIndex,
            @NotBlank String answer
    ) {}
}
