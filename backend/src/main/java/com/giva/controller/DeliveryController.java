package com.giva.controller;

import com.giva.dto.response.DeliveryCheckResponse;
import com.giva.service.DeliveryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/delivery")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping("/check")
    public ResponseEntity<DeliveryCheckResponse> check(@RequestParam String pincode) {
        return ResponseEntity.ok(deliveryService.check(pincode));
    }
}
