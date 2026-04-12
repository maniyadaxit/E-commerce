package com.giva.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record AdminProductInventoryRequest(
    @NotNull @Min(0) Long basePrice,
    @NotNull @Min(0) Long mrp,
    @NotNull @Min(0) Integer stockQty,
    boolean active,
    @Valid List<@NotNull AdminProductVariantInventoryRequest> variants
) {
}
