package com.giva.controller;

import com.giva.dto.request.ReviewRequest;
import com.giva.dto.response.ReviewResponse;
import com.giva.service.ReviewService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/products/{productId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> reviews(@PathVariable UUID productId) {
        return ResponseEntity.ok(reviewService.getApprovedReviews(productId));
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> create(@PathVariable UUID productId, @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.create(productId, request));
    }
}
