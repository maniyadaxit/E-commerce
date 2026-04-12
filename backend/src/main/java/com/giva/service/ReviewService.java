package com.giva.service;

import com.giva.dto.request.ReviewModerationRequest;
import com.giva.dto.request.ReviewRequest;
import com.giva.dto.response.ReviewResponse;
import com.giva.exception.BadRequestException;
import com.giva.exception.ResourceNotFoundException;
import com.giva.model.OrderStatus;
import com.giva.model.Product;
import com.giva.model.Review;
import com.giva.repository.OrderRepository;
import com.giva.repository.ProductRepository;
import com.giva.repository.ReviewRepository;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CurrentUserService currentUserService;
    private final ResponseMapper responseMapper;

    public ReviewService(
        ReviewRepository reviewRepository,
        ProductRepository productRepository,
        OrderRepository orderRepository,
        CurrentUserService currentUserService,
        ResponseMapper responseMapper
    ) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.currentUserService = currentUserService;
        this.responseMapper = responseMapper;
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getApprovedReviews(UUID productId) {
        return reviewRepository.findByProduct_IdAndApprovedTrueOrderByCreatedAtDesc(productId).stream()
            .map(responseMapper::toReviewResponse)
            .toList();
    }

    @Transactional
    public ReviewResponse create(UUID productId, ReviewRequest request) {
        Product product = productRepository.findByIdAndActiveTrue(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        boolean purchased = orderRepository.hasPurchasedProduct(
            currentUserService.userId(),
            productId,
            Set.of(OrderStatus.DELIVERED, OrderStatus.SHIPPED)
        );
        if (!purchased) {
            throw new BadRequestException("Only customers who purchased this product can review it");
        }

        Review review = Review.builder()
            .product(product)
            .user(currentUserService.user())
            .rating(request.rating())
            .title(request.title())
            .body(request.body())
            .imageUrl(request.imageUrl())
            .approved(false)
            .build();
        return responseMapper.toReviewResponse(reviewRepository.save(review));
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> listPending() {
        return reviewRepository.findByApprovedFalseOrderByCreatedAtDesc().stream()
            .map(responseMapper::toReviewResponse)
            .toList();
    }

    @Transactional
    public ReviewResponse moderate(UUID id, ReviewModerationRequest request) {
        Review review = reviewRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        review.setApproved(request.approved());
        return responseMapper.toReviewResponse(review);
    }
}
