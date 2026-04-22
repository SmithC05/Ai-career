package com.aicareernavigator.backend.resume;

import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/resume")
public class ResumeController {

    private final ResumeAnalysisService resumeAnalysisService;

    public ResumeController(ResumeAnalysisService resumeAnalysisService) {
        this.resumeAnalysisService = resumeAnalysisService;
    }

    /**
     * POST /api/v1/resume/analyse
     * Accepts a multipart PDF upload + optional job description string.
     * Returns the saved analysis DTO.
     */
    @PostMapping(value = "/analyse", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResumeAnalysisDto analyse(
            Authentication authentication,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "jobDescription", required = false) String jobDescription) {
        return resumeAnalysisService.analyseResume(authentication.getName(), file, jobDescription);
    }

    /**
     * GET /api/v1/resume/{id}
     * Returns a saved analysis belonging to the authenticated user.
     */
    @GetMapping("/{id}")
    public ResumeAnalysisDto getById(
            Authentication authentication,
            @PathVariable UUID id) {
        return resumeAnalysisService.getById(authentication.getName(), id);
    }
}
