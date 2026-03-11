package com.aicareernavigator.backend.career;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/careers")
public class CareerController {

    private final CareerService careerService;

    public CareerController(CareerService careerService) {
        this.careerService = careerService;
    }

    @GetMapping
    public List<CareerSummaryResponse> listCareers() {
        return careerService.listCareers();
    }

    @GetMapping("/{careerId}")
    public CareerDetailResponse getCareer(@PathVariable UUID careerId) {
        return careerService.getCareerById(careerId);
    }

    @GetMapping("/compare")
    public CareerComparisonResponse compareCareers(@RequestParam UUID careerA,
                                                   @RequestParam UUID careerB,
                                                   Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        return careerService.compareCareers(careerA, careerB, email);
    }
}
