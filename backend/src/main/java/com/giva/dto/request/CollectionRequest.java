package com.giva.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CollectionRequest(
    @NotBlank String name,
    @NotBlank String handle,
    String description,
    String bannerImageUrl,
    @NotNull Boolean active,
    @NotNull Integer sortOrder
) {
}
