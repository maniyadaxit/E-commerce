package com.giva.dto.response;

public record PaymentOrderResponse(
    String orderId,
    String currency,
    long amount,
    String keyId,
    boolean mock
) {
}
