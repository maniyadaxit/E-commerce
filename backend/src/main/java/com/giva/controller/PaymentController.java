package com.giva.controller;

import com.giva.dto.request.PaymentCreateOrderRequest;
import com.giva.dto.request.PaymentVerifyRequest;
import com.giva.dto.response.PaymentOrderResponse;
import com.giva.dto.response.PaymentVerificationResponse;
import com.giva.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<PaymentOrderResponse> createOrder(
            @Valid @RequestBody PaymentCreateOrderRequest request) {
        return ResponseEntity.ok(paymentService.createOrder(request));
    }

    @PostMapping("/verify")
    public ResponseEntity<PaymentVerificationResponse> verify(
            @Valid @RequestBody PaymentVerifyRequest request) {
        return ResponseEntity.ok(paymentService.verify(request));
    }
}