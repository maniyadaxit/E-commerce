package com.giva.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CouponValidationRequest(
    @NotBlank String code,
    @NotNull @Min(0) Long cartTotal
) {
}
