package com.giva.dto.response;

import com.giva.model.ProductMetal;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record AdminProductInventoryResponse(
    UUID id,
    String name,
    String slug,
    ProductMetal metal,
    long basePrice,
    long mrp,
    int stockQty,
    boolean active,
    BigDecimal weightGrams,
    String primaryCollectionName,
    List<AdminProductVariantInventoryResponse> variants
) {
}
