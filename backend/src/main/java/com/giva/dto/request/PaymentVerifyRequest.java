package com.giva.dto.request;

import jakarta.validation.constraints.NotBlank;

public record PaymentVerifyRequest(
    @NotBlank String razorpayOrderId,
    @NotBlank String razorpayPaymentId,
    @NotBlank String razorpaySignature
) {
}
