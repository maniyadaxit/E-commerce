package com.giva.controller;

import com.giva.dto.response.StoreLocationResponse;
import com.giva.service.StoreService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/stores")
public class StoreController {

    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    @GetMapping
    public ResponseEntity<List<StoreLocationResponse>> stores(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(storeService.search(q));
    }
}
