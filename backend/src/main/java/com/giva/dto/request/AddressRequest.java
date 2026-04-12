package com.giva.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AddressRequest(
    @NotBlank @Size(max = 120) String name,
    @NotBlank @Pattern(regexp = "^[0-9]{10}$") String phone,
    @NotBlank @Size(max = 180) String line1,
    @Size(max = 180) String line2,
    @NotBlank @Size(max = 120) String city,
    @NotBlank @Size(max = 120) String state,
    @NotBlank @Pattern(regexp = "^[0-9]{6}$") String pincode,
    boolean defaultAddress
) {
}
