package com.giva.dto.request;

import com.giva.model.ProductColour;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProductImageRequest(
    ProductColour colour,
    @NotBlank String url,
    String altText,
    @NotNull Integer sortOrder,
    boolean primary
) {
}
