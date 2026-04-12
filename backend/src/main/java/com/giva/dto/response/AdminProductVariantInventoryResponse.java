package com.giva.dto.response;

import com.giva.model.ProductColour;
import java.util.UUID;

public record AdminProductVariantInventoryResponse(
    UUID id,
    ProductColour colour,
    String size,
    String sku,
    long price,
    int stockQty
) {
}
