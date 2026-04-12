package com.giva.dto.response;

public record AuthResponse(
    UserResponse user,
    String accessToken,
    String refreshToken
) {
}
