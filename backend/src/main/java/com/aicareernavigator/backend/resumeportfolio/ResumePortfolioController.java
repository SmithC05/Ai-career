package com.aicareernavigator.backend.resumeportfolio;

import com.aicareernavigator.backend.ai.ResumePortfolioBuilderRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resume-portfolio")
public class ResumePortfolioController {

    private final ResumePortfolioService resumePortfolioService;

    public ResumePortfolioController(ResumePortfolioService resumePortfolioService) {
        this.resumePortfolioService = resumePortfolioService;
    }

    @PostMapping("/generate")
    public GenerateResumePortfolioResponse generate(Authentication authentication,
                                                    @Valid @RequestBody ResumePortfolioBuilderRequest request) {
        return resumePortfolioService.generateAndSave(authentication.getName(), request);
    }

    @GetMapping
    public List<ResumePortfolioListItem> list(Authentication authentication) {
        return resumePortfolioService.listUserItems(authentication.getName());
    }
}
