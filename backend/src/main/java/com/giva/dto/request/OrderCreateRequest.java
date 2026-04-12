package com.giva.dto.request;

import com.giva.model.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record OrderCreateRequest(
    @NotNull UUID addressId,
    @NotNull PaymentMethod paymentMethod,
    String couponCode,
    String paymentId,
    String razorpayOrderId
) {
}
