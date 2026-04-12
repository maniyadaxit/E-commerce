package com.giva.controller;

import com.giva.dto.request.CartItemRequest;
import com.giva.dto.request.CartItemUpdateRequest;
import com.giva.dto.response.CartResponse;
import com.giva.service.CartService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartResponse> cart() {
        return ResponseEntity.ok(cartService.getCart());
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> add(@Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addItem(request));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<CartResponse> update(@PathVariable UUID id, @Valid @RequestBody CartItemUpdateRequest request) {
        return ResponseEntity.ok(cartService.updateItem(id, request));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        cartService.removeItem(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clear() {
        cartService.clear();
        return ResponseEntity.noContent().build();
    }
}
