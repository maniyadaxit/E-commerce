package com.giva.controller;

import com.giva.dto.request.OrderCreateRequest;
import com.giva.dto.request.OrderStatusUpdateRequest;
import com.giva.dto.response.OrderDetailResponse;
import com.giva.dto.response.OrderSummaryResponse;
import com.giva.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderSummaryResponse>> orders() {
        return ResponseEntity.ok(orderService.mine());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDetailResponse> order(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.mineById(id));
    }

    @PostMapping
    public ResponseEntity<OrderDetailResponse> place(@Valid @RequestBody OrderCreateRequest request) {
        return ResponseEntity.ok(orderService.place(request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<OrderDetailResponse> updateStatus(
        @PathVariable UUID id,
        @Valid @RequestBody OrderStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(orderService.updateStatus(id, request));
    }
}
