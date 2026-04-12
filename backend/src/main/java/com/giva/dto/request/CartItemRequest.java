package com.giva.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CartItemRequest(
    @NotNull UUID productId,
    UUID variantId,
    @NotNull @Min(1) Integer quantity,
    String customizationText
) {
}
