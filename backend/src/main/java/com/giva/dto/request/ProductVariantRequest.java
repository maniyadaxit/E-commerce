package com.giva.dto.request;

import com.giva.model.ProductColour;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProductVariantRequest(
    @NotNull ProductColour colour,
    String size,
    @NotBlank String sku,
    Long priceOverride,
    @NotNull @Min(0) Integer stockQty
) {
}
