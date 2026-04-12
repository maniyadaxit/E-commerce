package com.giva.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ReviewResponse(
    UUID id,
    int rating,
    String title,
    String body,
    String imageUrl,
    boolean approved,
    String userName,
    OffsetDateTime createdAt
) {
}
