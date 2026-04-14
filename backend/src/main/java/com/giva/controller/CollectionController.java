package com.giva.controller;

import com.giva.dto.request.CollectionRequest;
import com.giva.dto.response.CollectionResponse;
import com.giva.dto.response.PageResponse;
import com.giva.dto.response.ProductCardResponse;
import com.giva.service.CollectionService;
import com.giva.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/collections")
public class CollectionController {

    private final CollectionService collectionService;
    private final ProductService productService;

    public CollectionController(CollectionService collectionService, ProductService productService) {
        this.collectionService = collectionService;
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<CollectionResponse>> collections() {
        return ResponseEntity.ok(collectionService.getAll());
    }

    @GetMapping("/{handle}/products")
    public ResponseEntity<PageResponse<ProductCardResponse>> collectionProducts(
        @PathVariable String handle,
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
            page, size, q, metal, color, style, occasion, recipient, theme, minPrice, maxPrice, sort, handle
        ));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<CollectionResponse> create(@Valid @RequestBody CollectionRequest request) {
        return ResponseEntity.ok(collectionService.create(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> delete(@PathVariable java.util.UUID id) {
        collectionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
