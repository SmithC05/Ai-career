package com.aicareernavigator.backend.ai;

import java.util.List;

public record PortfolioProject(
    String name,
    String problem,
    String solution,
    List<String> stack,
    String impact
) {
}
