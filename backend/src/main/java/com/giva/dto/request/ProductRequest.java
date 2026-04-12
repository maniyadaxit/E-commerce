package com.giva.dto.request;

import com.giva.model.ProductMetal;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record ProductRequest(
    @NotBlank String name,
    @NotBlank String description,
    @NotNull ProductMetal metal,
    @NotNull @Min(0) Long basePrice,
    @NotNull @Min(0) Long mrp,
    boolean bestseller,
    boolean active,
    boolean allowCustomization,
    @NotNull @Min(0) Integer stockQty,
    @NotNull @DecimalMin("0.01") BigDecimal weightGrams,
    UUID primaryCollectionId,
    List<UUID> collectionIds,
    @Valid @NotEmpty List<ProductVariantRequest> variants,
    @Valid @NotEmpty List<ProductImageRequest> images,
    Map<String, List<String>> attributes
) {
}
