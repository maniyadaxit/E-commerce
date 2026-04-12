package com.giva.dto.response;

import com.giva.model.UserRole;
import java.time.LocalDate;
import java.util.UUID;

public record UserResponse(
    UUID id,
    String name,
    String email,
    String phone,
    UserRole role,
    boolean enabled,
    LocalDate birthday
) {
}
