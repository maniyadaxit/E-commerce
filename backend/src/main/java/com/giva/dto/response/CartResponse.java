package com.giva.dto.response;

import java.util.List;
import java.util.UUID;

public record CartResponse(
    UUID id,
    List<CartItemResponse> items,
    long subtotal,
    long totalItems
) {
}
