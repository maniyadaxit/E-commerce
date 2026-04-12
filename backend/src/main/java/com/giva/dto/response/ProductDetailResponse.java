package com.giva.dto.response;

import com.giva.model.ProductMetal;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record ProductDetailResponse(
    UUID id,
    String name,
    String slug,
    String description,
    ProductMetal metal,
    Long price,
    Long mrp,
    boolean bestseller,
    boolean active,
    boolean customizable,
    int stockQty,
    BigDecimal weightGrams,
    int discountPercent,
    double rating,
    long reviewCount,
    List<String> collections,
    List<ProductVariantResponse> variants,
    List<ProductImageResponse> images,
    Map<String, List<String>> attributes,
    List<ReviewResponse> reviews
) {
}
