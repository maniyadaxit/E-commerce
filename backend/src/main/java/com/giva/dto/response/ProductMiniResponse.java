package com.giva.dto.response;

import com.giva.model.ProductMetal;
import java.util.UUID;

public record ProductMiniResponse(
    UUID id,
    String name,
    String slug,
    ProductMetal metal,
    Long price,
    Long mrp,
    String primaryImageUrl
) {
}
