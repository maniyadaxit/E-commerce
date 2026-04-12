package com.giva.dto.response;

public record DeliveryCheckResponse(
    String pincode,
    String deliveryType,
    String estimatedDeliveryDate,
    String message
) {
}
