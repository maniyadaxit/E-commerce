package com.giva.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReviewRequest(
    @Min(1) @Max(5) int rating,
    @Size(max = 140) String title,
    @NotBlank String body,
    String imageUrl
) {
}
