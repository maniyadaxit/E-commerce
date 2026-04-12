package com.giva.dto.request;

import com.giva.model.DiscountType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public record CouponRequest(
    @NotBlank String code,
    @NotNull DiscountType discountType,
    @NotNull @Min(0) Long discountValue,
    @NotNull @Min(0) Long minOrderValue,
    Integer maxUses,
    @NotNull OffsetDateTime validFrom,
    @NotNull OffsetDateTime validUntil,
    boolean active
) {
}
