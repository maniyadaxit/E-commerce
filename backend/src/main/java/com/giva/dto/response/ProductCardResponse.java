package com.giva.dto.response;

import com.giva.model.ProductMetal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ProductCardResponse(
    UUID id,
    String name,
    String slug,
    ProductMetal metal,
    Long price,
    Long mrp,
    boolean bestseller,
    boolean active,
    boolean sale,
    String primaryImageUrl,
    String hoverImageUrl,
    List<String> colourSwatches,
    double rating,
    long reviewCount,
    OffsetDateTime createdAt
) {
}
