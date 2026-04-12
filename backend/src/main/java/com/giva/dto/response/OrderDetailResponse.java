package com.giva.dto.response;

import com.giva.model.OrderStatus;
import com.giva.model.PaymentMethod;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record OrderDetailResponse(
    UUID id,
    OrderStatus status,
    AddressResponse address,
    long subtotal,
    long discount,
    long shippingFee,
    long total,
    String couponCode,
    PaymentMethod paymentMethod,
    String paymentId,
    String razorpayOrderId,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    List<OrderItemResponse> items
) {
}
