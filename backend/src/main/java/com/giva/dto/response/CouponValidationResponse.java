package com.giva.dto.response;

public record CouponValidationResponse(
    boolean valid,
    String code,
    long discountAmount,
    long finalTotal,
    String message
) {
}
