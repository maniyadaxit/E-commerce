package com.giva.dto.response;

import java.util.UUID;

public record AddressResponse(
    UUID id,
    String name,
    String phone,
    String line1,
    String line2,
    String city,
    String state,
    String pincode,
    boolean defaultAddress
) {
}
