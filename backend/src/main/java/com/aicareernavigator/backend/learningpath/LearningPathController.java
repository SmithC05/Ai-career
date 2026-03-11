package com.aicareernavigator.backend.learningpath;

import com.aicareernavigator.backend.ai.PersonalizedLearningPathRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/learning-paths")
public class LearningPathController {

    private final LearningPathService learningPathService;

    public LearningPathController(LearningPathService learningPathService) {
        this.learningPathService = learningPathService;
    }

    @PostMapping("/generate")
    public GenerateLearningPathResponse generateLearningPath(Authentication authentication,
                                                             @Valid @RequestBody PersonalizedLearningPathRequest request) {
        return learningPathService.generateAndSave(authentication.getName(), request);
    }

    @GetMapping
    public List<LearningPathListItem> listLearningPaths(Authentication authentication) {
        return learningPathService.listUserLearningPaths(authentication.getName());
    }
}
