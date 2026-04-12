package com.giva.dto.response;

import com.giva.model.UserRole;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AdminUserResponse(
    UUID id,
    String name,
    String email,
    String phone,
    UserRole role,
    boolean enabled,
    OffsetDateTime createdAt
) {
}
