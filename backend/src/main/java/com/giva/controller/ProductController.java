package com.giva.controller;

import com.giva.dto.request.ProductRequest;
import com.giva.dto.response.PageResponse;
import com.giva.dto.response.ProductCardResponse;
import com.giva.dto.response.ProductDetailResponse;
import com.giva.service.ProductService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<ProductCardResponse>> products(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size,
        @RequestParam(required = false) String q,
        @RequestParam(required = false) String metal,
        @RequestParam(required = false) String color,
        @RequestParam(required = false) String style,
        @RequestParam(required = false) String occasion,
        @RequestParam(required = false) String recipient,
        @RequestParam(required = false) String theme,
        @RequestParam(required = false) Long minPrice,
        @RequestParam(required = false) Long maxPrice,
        @RequestParam(required = false) String sort
    ) {
        return ResponseEntity.ok(productService.getProducts(
            page, size, q, metal, color, style, occasion, recipient, theme, minPrice, maxPrice, sort, null
        ));
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<ProductCardResponse>> search(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size,
        @RequestParam(required = false) String q,
        @RequestParam(required = false) String metal,
        @RequestParam(required = false) String color,
        @RequestParam(required = false) String style,
        @RequestParam(required = false) String occasion,
        @RequestParam(required = false) String recipient,
        @RequestParam(required = false) String theme,
        @RequestParam(required = false) Long minPrice,
        @RequestParam(required = false) Long maxPrice,
        @RequestParam(required = false) String sort
    ) {
        return ResponseEntity.ok(productService.getProducts(
            page, size, q, metal, color, style, occasion, recipient, theme, minPrice, maxPrice, sort, null
        ));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ProductDetailResponse> product(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getBySlug(slug));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ProductDetailResponse> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ProductDetailResponse> update(@PathVariable UUID id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
