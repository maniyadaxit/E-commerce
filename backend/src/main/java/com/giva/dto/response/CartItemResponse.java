package com.giva.dto.response;

import java.util.UUID;

public record CartItemResponse(
    UUID id,
    ProductMiniResponse product,
    ProductVariantResponse variant,
    int quantity,
    String customizationText,
    long lineTotal
) {
}
