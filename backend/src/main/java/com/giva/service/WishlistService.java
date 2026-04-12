package com.giva.service;

import com.giva.dto.response.ProductCardResponse;
import com.giva.exception.ResourceNotFoundException;
import com.giva.model.Product;
import com.giva.model.WishlistId;
import com.giva.model.WishlistItem;
import com.giva.repository.ProductRepository;
import com.giva.repository.ReviewRepository;
import com.giva.repository.WishlistRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final CurrentUserService currentUserService;
    private final ResponseMapper responseMapper;

    public WishlistService(
        WishlistRepository wishlistRepository,
        ProductRepository productRepository,
        ReviewRepository reviewRepository,
        CurrentUserService currentUserService,
        ResponseMapper responseMapper
    ) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
        this.currentUserService = currentUserService;
        this.responseMapper = responseMapper;
    }

    @Transactional(readOnly = true)
    public List<ProductCardResponse> getWishlist() {
        return wishlistRepository.findByUser_Id(currentUserService.userId()).stream()
            .map(WishlistItem::getProduct)
            .map(product -> responseMapper.toProductCardResponse(
                product,
                reviewRepository.averageRating(product.getId()),
                reviewRepository.countByProduct_IdAndApprovedTrue(product.getId())
            ))
            .toList();
    }

    @Transactional
    public void add(UUID productId) {
        Product product = productRepository.findByIdAndActiveTrue(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        WishlistId id = new WishlistId(currentUserService.userId(), productId);
        if (!wishlistRepository.existsById(id)) {
            wishlistRepository.save(WishlistItem.builder()
                .id(id)
                .user(currentUserService.user())
                .product(product)
                .addedAt(OffsetDateTime.now())
                .build());
        }
    }

    @Transactional
    public void remove(UUID productId) {
        wishlistRepository.deleteByUser_IdAndProduct_Id(currentUserService.userId(), productId);
    }
}
