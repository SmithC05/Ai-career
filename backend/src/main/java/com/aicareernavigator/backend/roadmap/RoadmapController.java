package com.aicareernavigator.backend.roadmap;

import com.aicareernavigator.backend.ai.RoadmapGeneratorRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roadmaps")
public class RoadmapController {

    private final RoadmapService roadmapService;

    public RoadmapController(RoadmapService roadmapService) {
        this.roadmapService = roadmapService;
    }

    @PostMapping("/generate")
    public GenerateRoadmapResponse generateRoadmap(Authentication authentication,
                                                   @Valid @RequestBody RoadmapGeneratorRequest request) {
        return roadmapService.generateAndSave(authentication.getName(), request);
    }

    @GetMapping
    public List<RoadmapListItem> listRoadmaps(Authentication authentication) {
        return roadmapService.listUserRoadmaps(authentication.getName());
    }
}
