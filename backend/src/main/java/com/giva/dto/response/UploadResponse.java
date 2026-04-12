package com.giva.dto.response;

public record UploadResponse(
    String url,
    String path,
    String filename
) {
}
