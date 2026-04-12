package com.giva.dto.response;

import java.util.UUID;

public record OrderItemResponse(
    UUID id,
    UUID productId,
    String productName,
    String productSlug,
    String imageUrl,
    int quantity,
    long unitPrice,
    String customizationText
) {
}
