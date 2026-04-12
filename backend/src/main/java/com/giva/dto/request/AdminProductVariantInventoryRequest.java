package com.giva.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AdminProductVariantInventoryRequest(
    @NotNull UUID id,
    @NotNull @Min(0) Long price,
    @NotNull @Min(0) Integer stockQty
) {
}
