package com.giva.dto.response;

import com.giva.model.OrderStatus;
import com.giva.model.PaymentMethod;
import java.time.OffsetDateTime;
import java.util.UUID;

public record OrderSummaryResponse(
    UUID id,
    OrderStatus status,
    long subtotal,
    long discount,
    long shippingFee,
    long total,
    PaymentMethod paymentMethod,
    OffsetDateTime createdAt
) {
}
