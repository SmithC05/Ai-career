package com.aicareernavigator.backend.auth;

import java.util.UUID;

public record AuthResponse(
    UUID userId,
    String fullName,
    String email,
    String token
) {
}
