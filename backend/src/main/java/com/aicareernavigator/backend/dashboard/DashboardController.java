package com.aicareernavigator.backend.dashboard;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardResponse getDashboard(Authentication authentication) {
        return dashboardService.getDashboard(authentication.getName());
    }

    @PostMapping("/saved-careers/{careerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void saveCareer(Authentication authentication, @PathVariable UUID careerId) {
        dashboardService.saveCareer(authentication.getName(), careerId);
    }

    @DeleteMapping("/saved-careers/{careerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeSavedCareer(Authentication authentication, @PathVariable UUID careerId) {
        dashboardService.removeSavedCareer(authentication.getName(), careerId);
    }
}
