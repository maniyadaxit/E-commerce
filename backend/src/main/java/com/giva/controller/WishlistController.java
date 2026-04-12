package com.giva.controller;

import com.giva.dto.response.ProductCardResponse;
import com.giva.service.WishlistService;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public ResponseEntity<List<ProductCardResponse>> wishlist() {
        return ResponseEntity.ok(wishlistService.getWishlist());
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Void> add(@PathVariable UUID productId) {
        wishlistService.add(productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> remove(@PathVariable UUID productId) {
        wishlistService.remove(productId);
        return ResponseEntity.noContent().build();
    }
}
