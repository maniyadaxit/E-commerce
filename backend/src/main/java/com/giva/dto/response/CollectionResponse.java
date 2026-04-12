package com.giva.dto.response;

import java.util.UUID;

public record CollectionResponse(
    UUID id,
    String name,
    String handle,
    String description,
    String bannerImageUrl,
    boolean active,
    int sortOrder,
    long productCount
) {
}
