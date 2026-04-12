package com.giva.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record BlogDetailResponse(
    UUID id,
    String title,
    String slug,
    String content,
    String author,
    String coverImageUrl,
    OffsetDateTime publishedAt
) {
}
