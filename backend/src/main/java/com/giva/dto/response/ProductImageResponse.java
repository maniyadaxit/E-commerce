package com.giva.dto.response;

import com.giva.model.ProductColour;
import java.util.UUID;

public record ProductImageResponse(
    UUID id,
    ProductColour colour,
    String url,
    String altText,
    int sortOrder,
    boolean primary
) {
}
