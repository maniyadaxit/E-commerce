package com.giva.exception;

import java.time.OffsetDateTime;
import java.util.List;

public record ApiErrorResponse(
    int status,
    String message,
    List<String> errors,
    OffsetDateTime timestamp
) {
}
