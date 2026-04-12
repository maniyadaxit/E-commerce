package com.giva.dto.response;

import com.giva.model.DiscountType;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CouponResponse(
    UUID id,
    String code,
    DiscountType discountType,
    long discountValue,
    long minOrderValue,
    Integer maxUses,
    int usedCount,
    OffsetDateTime validFrom,
    OffsetDateTime validUntil,
    boolean active
) {
}
