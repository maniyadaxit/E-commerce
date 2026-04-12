package com.giva.dto.response;

import com.giva.model.ProductColour;
import java.util.UUID;

public record ProductVariantResponse(
    UUID id,
    ProductColour colour,
    String size,
    String sku,
    Long price,
    int stockQty
) {
}
