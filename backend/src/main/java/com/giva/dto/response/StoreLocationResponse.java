package com.giva.dto.response;

public record StoreLocationResponse(
    String city,
    String name,
    String address,
    String pincode,
    String phone,
    String mapEmbedUrl,
    double latitude,
    double longitude
) {
}
