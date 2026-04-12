package com.giva.controller;

import com.giva.dto.request.AdminProductInventoryRequest;
import com.giva.dto.request.CouponRequest;
import com.giva.dto.request.ReviewModerationRequest;
import com.giva.dto.response.AdminProductInventoryResponse;
import com.giva.dto.response.AdminUserResponse;
import com.giva.dto.response.CouponResponse;
import com.giva.dto.response.DashboardStatsResponse;
import com.giva.dto.response.OrderSummaryResponse;
import com.giva.dto.response.PageResponse;
import com.giva.dto.response.ReviewResponse;
import com.giva.service.AdminService;
import com.giva.service.CouponService;
import com.giva.service.OrderService;
import com.giva.service.ProductService;
import com.giva.service.ResponseMapper;
import com.giva.service.ReviewService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/owner", "/api/v1/admin"})
public class AdminController {

    private final AdminService adminService;
    private final OrderService orderService;
    private final ReviewService reviewService;
    private final CouponService couponService;
    private final ProductService productService;
    private final ResponseMapper responseMapper;

    public AdminController(
        AdminService adminService,
        OrderService orderService,
        ReviewService reviewService,
        CouponService couponService,
        ProductService productService,
        ResponseMapper responseMapper
    ) {
        this.adminService = adminService;
        this.orderService = orderService;
        this.reviewService = reviewService;
        this.couponService = couponService;
        this.productService = productService;
        this.responseMapper = responseMapper;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> dashboard() {
        return ResponseEntity.ok(adminService.dashboard());
    }

    @GetMapping("/orders")
    public ResponseEntity<PageResponse<OrderSummaryResponse>> orders(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo
    ) {
        return ResponseEntity.ok(orderService.adminOrders(page, size, status, dateFrom, dateTo));
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> users() {
        return ResponseEntity.ok(adminService.users());
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<AdminUserResponse> setUserStatus(@PathVariable UUID id, @RequestParam boolean enabled) {
        return ResponseEntity.ok(adminService.setUserEnabled(id, enabled));
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<ReviewResponse>> pendingReviews() {
        return ResponseEntity.ok(reviewService.listPending());
    }

    @PatchMapping("/reviews/{id}")
    public ResponseEntity<ReviewResponse> moderateReview(
        @PathVariable UUID id,
        @Valid @RequestBody ReviewModerationRequest request
    ) {
        return ResponseEntity.ok(reviewService.moderate(id, request));
    }

    @GetMapping("/coupons")
    public ResponseEntity<List<CouponResponse>> coupons() {
        return ResponseEntity.ok(couponService.listCoupons().stream().map(responseMapper::toCouponResponse).toList());
    }

    @GetMapping("/products/{id}/inventory")
    public ResponseEntity<AdminProductInventoryResponse> productInventory(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getAdminInventory(id));
    }

    @PatchMapping("/products/{id}/inventory")
    public ResponseEntity<AdminProductInventoryResponse> updateProductInventory(
        @PathVariable UUID id,
        @Valid @RequestBody AdminProductInventoryRequest request
    ) {
        return ResponseEntity.ok(productService.updateAdminInventory(id, request));
    }

    @PostMapping("/coupons")
    public ResponseEntity<CouponResponse> createCoupon(@Valid @RequestBody CouponRequest request) {
        return ResponseEntity.ok(responseMapper.toCouponResponse(couponService.create(request)));
    }
}
