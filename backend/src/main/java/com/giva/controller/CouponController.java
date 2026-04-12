package com.giva.controller;

import com.giva.dto.request.CouponValidationRequest;
import com.giva.dto.response.CouponValidationResponse;
import com.giva.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @PostMapping("/validate")
    public ResponseEntity<CouponValidationResponse> validate(@Valid @RequestBody CouponValidationRequest request) {
        return ResponseEntity.ok(couponService.validate(request));
    }
}
