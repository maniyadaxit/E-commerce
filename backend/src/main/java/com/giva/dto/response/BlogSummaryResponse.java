package com.giva.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record BlogSummaryResponse(
    UUID id,
    String title,
    String slug,
    String excerpt,
    String author,
    String coverImageUrl,
    OffsetDateTime publishedAt
) {
}
