package com.giva.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UserUpdateRequest(
    @NotBlank @Size(max = 120) String name,
    @NotBlank @Email @Size(max = 180) String email,
    @NotBlank @Pattern(regexp = "^[0-9]{10}$") String phone,
    LocalDate birthday
) {
}
